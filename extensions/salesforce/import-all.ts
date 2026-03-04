/**
 * Full import of all published Salesforce Knowledge articles into Cognigy Knowledge AI.
 * Same logic as the connector — fetches from Salesforce, processes text, creates
 * sources + chunks via the Cognigy REST API.
 * Run: npx ts-node import-all.ts
 * Resume: npx ts-node import-all.ts --from=235
 */

import * as dotenv from "dotenv";
dotenv.config();

import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import { authenticate } from "./src/authenticate";

// ─── State file ───────────────────────────────────────────────────────────────

const STATE_FILE = path.join(__dirname, "import-state.json");

interface ArticleState {
  agentSourceId?: string;
  supervisorSourceId?: string;
  lastPublishedDate: string;
}

type ImportState = Record<string, ArticleState>; // keyed by articleNumber

function loadState(): ImportState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    }
  } catch {
    console.warn("Warning: Could not read import-state.json, starting fresh.");
  }
  return {};
}

function saveState(state: ImportState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<\/th>/gi, " | ")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function chunkContent(text: string, maxSize: number = 2000): string[] {
  if (!text || text.length === 0) return [];
  if (text.length <= maxSize) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxSize) {
      chunks.push(remaining.trim());
      break;
    }
    let splitAt = remaining.lastIndexOf("\n\n", maxSize);
    if (splitAt < maxSize * 0.5) splitAt = remaining.lastIndexOf("\n", maxSize);
    if (splitAt < maxSize * 0.5) splitAt = remaining.lastIndexOf(". ", maxSize);
    if (splitAt < maxSize * 0.5) splitAt = remaining.lastIndexOf(" ", maxSize);
    if (splitAt <= 0) splitAt = maxSize;
    const chunk = remaining.substring(0, splitAt).trim();
    if (chunk.length > 0) chunks.push(chunk);
    remaining = remaining.substring(splitAt).trim();
  }
  return chunks.filter((c) => c.length > 0);
}

function sanitizeSourceName(name: string): string {
  return name
    .replace(/\u2013|\u2014/g, "-")
    .replace(/&/g, "and")
    .replace(/[/?!:()#*+<>=^~%@\\]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/-{2,}/g, "-")
    .trim();
}

function buildArticleText(
  title: string,
  summary: string,
  fields: string[],
  article: any,
): string {
  const sections: string[] = [];
  if (title) sections.push(`# ${sanitizeText(title)}`);
  if (summary) sections.push(sanitizeText(stripHtml(summary)));
  for (const field of fields) {
    const raw = article[field];
    if (!raw) continue;
    const content = sanitizeText(stripHtml(String(raw)));
    if (!content) continue;
    const label = field.replace(/__c$/i, "").replace(/_/g, " ");
    sections.push(`${label}:\n${content}`);
  }
  return sections.join("\n\n");
}

// ─── Cognigy REST API helpers ─────────────────────────────────────────────────

const STORE_ID = process.env.COGNIGY_KNOWLEDGE_STORE_ID!;

function makeCognigyApi(): AxiosInstance {
  return axios.create({
    baseURL: process.env.COGNIGY_API_BASE,
    headers: { "X-API-Key": process.env.COGNIGY_API_KEY },
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Detect AWS WAF / CAPTCHA HTML response instead of JSON */
function isWafResponse(err: any): boolean {
  const body = err.response?.data;
  if (typeof body === "string" && body.includes("<html")) return true;
  if (typeof body === "string" && body.toLowerCase().includes("captcha"))
    return true;
  return false;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 5,
): Promise<T> {
  let delay = 2000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err.response?.status;

      if (isWafResponse(err)) {
        console.warn(
          `  [WAF detected] ${label} — AWS WAF challenge returned. Waiting 60s before retry...`,
        );
        await sleep(60000);
        // Reset delay after WAF cooldown
        delay = 2000;
        continue;
      }

      const retryable =
        status === 405 ||
        status === 429 ||
        status === 503 ||
        status === 502 ||
        !status;
      if (retryable && attempt < maxRetries) {
        console.warn(
          `  [retry ${attempt}/${maxRetries - 1}] ${label} — HTTP ${status ?? err.message}, waiting ${delay / 1000}s...`,
        );
        await sleep(delay);
        delay = Math.min(delay * 2, 30000);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`${label} failed after ${maxRetries} attempts`);
}

/** Returns true if the error message indicates a duplicate name conflict */
function isDuplicateNameError(err: any): boolean {
  const detail: string = err.response?.data?.detail || err.message || "";
  return detail.toLowerCase().includes("already exists");
}

async function createSource(api: AxiosInstance, name: string): Promise<string> {
  const resp = await withRetry(
    () =>
      api.post(`/v2.0/knowledgestores/${STORE_ID}/sources`, {
        name,
        type: "manual",
      }),
    `createSource(${name})`,
  );
  return resp.data.knowledgeSource._id as string;
}

async function createChunk(
  api: AxiosInstance,
  sourceId: string,
  text: string,
  order: number,
  data: Record<string, string>,
): Promise<void> {
  await withRetry(
    () =>
      api.post(`/v2.0/knowledgestores/${STORE_ID}/sources/${sourceId}/chunks`, {
        text,
        order,
        data,
      }),
    `createChunk(order=${order})`,
  );
}

async function deleteSource(
  api: AxiosInstance,
  sourceId: string,
): Promise<void> {
  try {
    await api.delete(`/v2.0/knowledgestores/${STORE_ID}/sources/${sourceId}`);
  } catch {
    // best-effort cleanup
  }
}

// ─── Field config ─────────────────────────────────────────────────────────────

const agentFields = [
  "Overview__c",
  "Details__c",
  "Inclusions__c",
  "Exclusions__c",
  "Information__c",
  "Processing_Steps_Text__c",
  "Questions__c",
  "Answer__c",
  "Scripting__c",
  "Actions__c",
];
const supervisorFields = [
  "Manager_Actions__c",
  "Manager_information__c",
  "Manager_processing_steps__c",
  "Manager_scripting__c",
];

// ─── Per-article import ───────────────────────────────────────────────────────

type ImportResult = "imported" | "updated" | "skipped" | "failed" | "empty";

async function importArticle(
  cognigy: AxiosInstance,
  article: any,
  instanceUrl: string,
  index: number,
  total: number,
  state: ImportState,
): Promise<ImportResult> {
  const title = article.Title || `Article ${article.ArticleNumber}`;
  const summary = article.Summary || "";
  const articleNum = String(article.ArticleNumber || "");
  const knowledgeArticleId = String(article.KnowledgeArticleId || "");
  const articleUrl = `${instanceUrl}/lightning/articles/${knowledgeArticleId}`;
  const lastPublishedDate = String(article.LastPublishedDate || "");
  const prefix = `[${index}/${total}] [${articleNum}]`;

  const agentText = buildArticleText(title, summary, agentFields, article);
  const agentChunks = chunkContent(agentText);

  const hasSupervisor = supervisorFields.some((f) => {
    const raw = article[f];
    return raw && sanitizeText(stripHtml(String(raw))).length > 0;
  });
  const supervisorChunks = hasSupervisor
    ? chunkContent(buildArticleText(title, summary, supervisorFields, article))
    : [];

  if (agentChunks.length === 0 && supervisorChunks.length === 0) {
    console.log(`${prefix} SKIP — no content`);
    return "empty";
  }

  // ── Check if already imported and up-to-date ──────────────────────────────
  const existing = state[articleNum];
  if (existing) {
    if (existing.lastPublishedDate === lastPublishedDate) {
      console.log(`${prefix} SKIP — up to date (${lastPublishedDate})`);
      return "skipped";
    }
    // Content may have changed — delete old sources and reimport
    console.log(
      `${prefix} UPDATE — date changed (${existing.lastPublishedDate} → ${lastPublishedDate})`,
    );
    if (existing.agentSourceId) {
      await deleteSource(cognigy, existing.agentSourceId);
    }
    if (existing.supervisorSourceId) {
      await deleteSource(cognigy, existing.supervisorSourceId);
    }
    delete state[articleNum];
    saveState(state);
  }

  let agentSourceId: string | undefined;
  let supervisorSourceId: string | undefined;
  let anyFailed = false;

  // ── Agent source ──────────────────────────────────────────────────────────
  if (agentChunks.length > 0) {
    const sourceName = sanitizeSourceName(`[${articleNum}] ${title}`);
    try {
      agentSourceId = await createSource(cognigy, sourceName);
      for (let i = 0; i < agentChunks.length; i++) {
        await createChunk(cognigy, agentSourceId, agentChunks[i], i, {
          articleNumber: articleNum,
          role: "agent",
          url: articleUrl,
        });
      }
      console.log(`${prefix} Agent OK — ${agentChunks.length} chunk(s)`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;

      // If duplicate error and we don't have a state entry, the source
      // exists from a previous run that we have no record of — treat as
      // up-to-date (can't retrieve the source ID without the list API).
      if (isDuplicateNameError(err)) {
        console.warn(
          `${prefix} Agent SKIP — source already exists (no state record; treating as current)`,
        );
      } else {
        console.error(`${prefix} Agent FAILED — ${msg}`);
        anyFailed = true;
      }
      if (agentSourceId) await deleteSource(cognigy, agentSourceId);
      agentSourceId = undefined;
    }
  }

  // ── Supervisor source ─────────────────────────────────────────────────────
  if (supervisorChunks.length > 0) {
    const sourceName = sanitizeSourceName(`[${articleNum}] ${title} - Manager`);
    try {
      supervisorSourceId = await createSource(cognigy, sourceName);
      for (let i = 0; i < supervisorChunks.length; i++) {
        await createChunk(cognigy, supervisorSourceId, supervisorChunks[i], i, {
          articleNumber: articleNum,
          role: "supervisor",
          url: articleUrl,
        });
      }
      console.log(
        `${prefix} Supervisor OK — ${supervisorChunks.length} chunk(s)`,
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;
      if (isDuplicateNameError(err)) {
        console.warn(
          `${prefix} Supervisor SKIP — source already exists (no state record; treating as current)`,
        );
      } else {
        console.error(`${prefix} Supervisor FAILED — ${msg}`);
        anyFailed = true;
      }
      if (supervisorSourceId) await deleteSource(cognigy, supervisorSourceId);
      supervisorSourceId = undefined;
    }
  }

  // ── Persist state ─────────────────────────────────────────────────────────
  // Record even partial success so we can skip on re-run
  const hadPreviousEntry = !!existing;
  state[articleNum] = {
    ...(agentSourceId ? { agentSourceId } : {}),
    ...(supervisorSourceId ? { supervisorSourceId } : {}),
    lastPublishedDate,
  };
  saveState(state);

  if (anyFailed) return "failed";
  return hadPreviousEntry ? "updated" : "imported";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Authenticating with Salesforce...");
  const sf = await authenticate({
    consumerKey: process.env.SF_CONSUMER_KEY!,
    consumerSecret: process.env.SF_CONSUMER_SECRET!,
    instanceUrl: process.env.SF_INSTANCE_URL!,
  });
  console.log(`Authenticated. Instance: ${sf.instanceUrl}\n`);

  const allFields = [...new Set([...agentFields, ...supervisorFields])];
  const soql = [
    `SELECT Id, KnowledgeArticleId, ArticleNumber, Title, Summary, UrlName,`,
    `Language, LastPublishedDate, ${allFields.join(", ")}`,
    `FROM Knowledge_Article__kav`,
    `WHERE PublishStatus = 'Online'`,
    `AND Language = 'en_US'`,
    `AND IsLatestVersion = true`,
    `ORDER BY Title ASC`,
  ].join(" ");

  console.log("Fetching all published en_US articles...");
  const result = await sf.query(soql, { autoFetch: true });
  const articles = result.records;
  console.log(`Found ${articles.length} articles.\n`);

  // Support --from N to resume from a specific article index (1-based)
  const fromArg = process.argv.find((a) => a.startsWith("--from="));
  const startFrom = fromArg
    ? Math.max(0, parseInt(fromArg.split("=")[1], 10) - 1)
    : 0;
  if (startFrom > 0)
    console.log(`Resuming from article ${startFrom + 1}/${articles.length}\n`);

  const state = loadState();
  const stateCount = Object.keys(state).length;
  if (stateCount > 0) {
    console.log(
      `State file loaded: ${stateCount} article(s) already tracked.\n`,
    );
  }

  console.log("=".repeat(70));

  const cognigy = makeCognigyApi();
  const startTime = Date.now();

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let empty = 0;
  let failed = 0;

  for (let i = startFrom; i < articles.length; i++) {
    try {
      const outcome = await importArticle(
        cognigy,
        articles[i],
        sf.instanceUrl,
        i + 1,
        articles.length,
        state,
      );
      if (outcome === "imported") imported++;
      else if (outcome === "updated") updated++;
      else if (outcome === "skipped") skipped++;
      else if (outcome === "empty") empty++;
      else if (outcome === "failed") failed++;
    } catch (err: any) {
      failed++;
      console.error(
        `[${i + 1}/${articles.length}] Unexpected error: ${err.message}`,
      );
    }
    // Pause between every article to avoid WAF rate limiting
    await sleep(1500);
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log("=".repeat(70));
  console.log(`\nDone in ${elapsed}s`);
  console.log(`  Imported (new):       ${imported}`);
  console.log(`  Updated (changed):    ${updated}`);
  console.log(`  Skipped (up to date): ${skipped}`);
  console.log(`  Skipped (no content): ${empty}`);
  console.log(`  Errors:               ${failed}`);
}

main().catch((err) => {
  console.error("Fatal:", err.response?.data || err.message);
  process.exit(1);
});
