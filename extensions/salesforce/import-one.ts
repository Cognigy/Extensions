/**
 * Import one Salesforce Knowledge article directly into Cognigy Knowledge AI
 * via REST API (bypasses the extension runtime).
 *
 * Run: npx ts-node import-one.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { authenticate } from "./src/authenticate";

// ─── Same helpers as salesforceKnowledgeConnector.ts ─────────────────────────

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

    return chunks.filter(c => c.length > 0);
}

function buildArticleText(title: string, summary: string, fields: string[], article: any): string {
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

// ─── Cognigy Knowledge REST API ───────────────────────────────────────────────

const cognigyApi = axios.create({
    baseURL: process.env.COGNIGY_API_BASE,
    headers: { "X-API-Key": process.env.COGNIGY_API_KEY }
});

const STORE_ID = process.env.COGNIGY_KNOWLEDGE_STORE_ID!;

async function createKnowledgeSource(name: string, tags: string[]): Promise<string> {
    const resp = await cognigyApi.post(`/v2.0/knowledgestores/${STORE_ID}/sources`, {
        name,
        type: "manual"
    });
    const sourceId: string = resp.data.knowledgeSource._id;

    // Add tags via PATCH if any
    if (tags.length > 0) {
        try {
            await cognigyApi.patch(`/v2.0/knowledgestores/${STORE_ID}/sources/${sourceId}`, {
                metaData: { tags }
            });
        } catch {
            console.warn(`  Note: Could not set tags on source (non-critical)`);
        }
    }
    return sourceId;
}

async function createKnowledgeChunk(sourceId: string, text: string, order: number, metaData?: Record<string, string>): Promise<void> {
    await cognigyApi.post(`/v2.0/knowledgestores/${STORE_ID}/sources/${sourceId}/chunks`, {
        text,
        order,
        ...(metaData ? { data: metaData } : {})
    });
}

async function deleteKnowledgeSource(sourceId: string): Promise<void> {
    try {
        await cognigyApi.delete(`/v2.0/knowledgestores/${STORE_ID}/sources/${sourceId}`);
    } catch (e: any) {
        console.warn(`  Warning: Could not delete source ${sourceId}: ${e.message}`);
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const agentFields = [
        "Overview__c", "Details__c", "Inclusions__c", "Exclusions__c",
        "Information__c", "Processing_Steps_Text__c", "Questions__c",
        "Answer__c", "Scripting__c", "Actions__c"
    ];

    console.log("Authenticating with Salesforce...");
    const sf = await authenticate({
        consumerKey: process.env.SF_CONSUMER_KEY!,
        consumerSecret: process.env.SF_CONSUMER_SECRET!,
        instanceUrl: process.env.SF_INSTANCE_URL!
    });
    console.log("Authenticated.\n");

    // Fetch just ONE article (alphabetically first)
    const soql = [
        `SELECT Id, KnowledgeArticleId, ArticleNumber, Title, Summary, UrlName,`,
        `Language, LastPublishedDate, ${agentFields.join(", ")}`,
        `FROM Knowledge_Article__kav`,
        `WHERE PublishStatus = 'Online'`,
        `AND Language = 'en_US'`,
        `AND IsLatestVersion = true`,
        `ORDER BY Title ASC`,
        `LIMIT 1`
    ].join(" ");

    console.log("Fetching one article from Salesforce...");
    const result = await sf.query(soql);
    const article = result.records[0];
    if (!article) throw new Error("No article found");

    const title = article.Title || `Article ${article.ArticleNumber}`;
    const summary = article.Summary || "";
    const articleNum = String(article.ArticleNumber || "");
    const knowledgeArticleId = String(article.KnowledgeArticleId || "");
    const articleUrl = `${process.env.SF_INSTANCE_URL}/lightning/articles/${knowledgeArticleId}`;

    console.log(`Article: [${articleNum}] ${title}`);

    const agentText = buildArticleText(title, summary, agentFields, article);
    const agentChunks = chunkContent(agentText);

    console.log(`Chunks: ${agentChunks.length}`);
    agentChunks.forEach((c, i) => console.log(`  Chunk ${i + 1}: ${c.length} chars`));

    const sourceName = `[${articleNum}] ${title}`;
    console.log(`\nCreating knowledge source: "${sourceName}"...`);
    const sourceId = await createKnowledgeSource(sourceName, ["agent"]);
    console.log(`  Source ID: ${sourceId}`);

    console.log("Creating chunks...");
    for (let i = 0; i < agentChunks.length; i++) {
        process.stdout.write(`  Chunk ${i + 1}/${agentChunks.length}... `);
        try {
            await createKnowledgeChunk(sourceId, agentChunks[i], i, { articleNumber: articleNum, role: "agent", url: articleUrl });
            console.log("OK");
        } catch (err: any) {
            console.log(`FAILED: ${err.response?.data?.detail || err.message}`);
            console.log("  Cleaning up source...");
            await deleteKnowledgeSource(sourceId);
            throw new Error(`Chunk ${i + 1} failed: ${err.response?.data?.detail || err.message}`);
        }
    }

    console.log(`\nDone! Article "[${articleNum}] ${title}" imported successfully.`);
    console.log(`Check: https://jetstar-dev.cognigy.cloud/project/68e5bf2c1271c80086891c47/68e5bf2cd3f7785588c6af0b/knowledge/69a2c04eba85740ed7854db3`);
}

main().catch(err => {
    console.error("\nFatal error:", err.response?.data || err.message || err);
    process.exit(1);
});
