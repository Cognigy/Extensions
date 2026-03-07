import * as crypto from "crypto";
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

interface IOAuthConnection {
    consumerKey: string;
    consumerSecret: string;
    instanceUrl: string;
}

/**
 * Remove C0/C1 control characters. Preserves tab, LF, CR, and all printable
 * Unicode so non-English article content (accented chars, CJK) is kept intact.
 */
function sanitizeText(text: string): string {
    if (!text) return "";
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        .replace(/[\x7F-\x9F]/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

/**
 * Convert HTML from a Salesforce field to Markdown.
 * Heading levels are shifted down by fieldDepth so the field-label heading
 * (## FieldName) sits above any headings inside the HTML content.
 *
 * e.g. fieldDepth=2: <h1> → ###, <h2> → ####
 */
function htmlFieldToMarkdown(html: string, fieldDepth: number = 2): string {
    if (!html) return "";

    const shiftedH = (level: number) => "#".repeat(Math.min(level + fieldDepth, 6));
    const stripInner = (s: string) => s.replace(/<[^>]+>/g, "").trim();

    const md = html
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `${shiftedH(1)} ${stripInner(t)}\n\n`)
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `${shiftedH(2)} ${stripInner(t)}\n\n`)
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `${shiftedH(3)} ${stripInner(t)}\n\n`)
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `${shiftedH(4)} ${stripInner(t)}\n\n`)
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `${shiftedH(5)} ${stripInner(t)}\n\n`)
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `${shiftedH(6)} ${stripInner(t)}\n\n`)
        .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")
        .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "_$2_")
        .replace(/<ul[^>]*>/gi, "").replace(/<\/ul>/gi, "\n")
        .replace(/<ol[^>]*>/gi, "").replace(/<\/ol>/gi, "\n")
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${stripInner(t)}\n`)
        .replace(/<table[^>]*>/gi, "\n").replace(/<\/table>/gi, "\n")
        .replace(/<t(?:head|body|foot)[^>]*>/gi, "").replace(/<\/t(?:head|body|foot)>/gi, "")
        .replace(/<tr[^>]*>/gi, "").replace(/<\/tr>/gi, " |\n")
        .replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, (_, t) => `| **${stripInner(t)}** `)
        .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, (_, t) => `| ${stripInner(t)} `)
        .replace(/<\/p>/gi, "\n\n").replace(/<p[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n").replace(/<div[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return sanitizeText(md);
}

/** Sanitize a string for use as a Cognigy knowledge source name. */
function sanitizeSourceName(name: string): string {
    return name
        .replace(/\u2013|\u2014/g, "-")
        .replace(/&/g, "and")
        .replace(/[/?!()#*+<>=^~%@\\]/g, " ")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/-{2,}/g, "-")
        .trim();
}

/** Return true if the string is a valid Salesforce API identifier. */
function isValidSfApiName(name: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/** Return true if the string looks like a valid Salesforce language code. */
function isValidLanguageCode(lang: string): boolean {
    return /^[a-z]{2,3}(_[A-Za-z0-9]{2,8})*$/.test(lang);
}

/** First 12 hex chars of SHA-256 — used as contentHashOrTimestamp. */
function shortHash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
}

/**
 * Build a Markdown document from a Salesforce article's fields.
 *
 *   # Article Title
 *   ## Field Label
 *   <field content as markdown>
 *   ## Next Field Label
 *   ...
 *
 * Note: the standard Salesforce Summary field is intentionally excluded.
 * Add "Summary" to agentFields if you want it as a dedicated chunk, since
 * including it automatically duplicates content when Summary == Overview__c.
 */
function buildArticleText(title: string, fields: string[], article: any): string {
    const sections: string[] = [];

    if (title) sections.push(`# ${sanitizeText(title)}`);

    for (const field of fields) {
        const raw = article[field];
        if (!raw) continue;
        const content = htmlFieldToMarkdown(String(raw), 2);
        if (!content) continue;
        const label = field.replace(/__c$/i, "").replace(/_/g, " ").trim();
        sections.push(`## ${label}\n\n${content}`);
    }

    return sections.join("\n\n");
}

// ---------------------------------------------------------------------------
// Heading-aware chunker
// ---------------------------------------------------------------------------

const HARD_MAX_CHARS = 1950;
const MIN_BODY_CHARS = 30;

interface ArticleChunk {
    text: string;
    section: string;
}

/**
 * Split article Markdown into RAG-optimised chunks.
 * Splits at H2 (field-level) boundaries only; every chunk is prefixed with
 * the article's H1 title for context.
 */
function chunkArticleMarkdown(markdown: string, maxChars: number = 1800): ArticleChunk[] {
    const effective = Math.min(maxChars, HARD_MAX_CHARS);

    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const titlePrefix = titleMatch ? `# ${titleMatch[1].trim()}\n\n` : "";

    const lines = markdown.split("\n");
    const sections: Array<{ level: number; heading: string; content: string }> = [];
    let curLevel = 0;
    let curHeading = "";
    let curLines: string[] = [];
    let started = false;

    for (const line of lines) {
        const m = line.match(/^(#{1,2})\s+(.+)$/);
        if (m) {
            if (started) {
                sections.push({ level: curLevel, heading: curHeading, content: curLines.join("\n").trim() });
            }
            curLevel = m[1].length;
            curHeading = m[2].trim();
            curLines = [];
            started = true;
        } else if (started) {
            curLines.push(line);
        }
    }
    if (started) {
        sections.push({ level: curLevel, heading: curHeading, content: curLines.join("\n").trim() });
    }

    const chunks: ArticleChunk[] = [];

    for (const section of sections) {
        if (section.level === 1) {
            if (!section.content.trim()) continue;
            const fullText = titlePrefix + section.content;
            if (fullText.length <= effective) {
                chunks.push({ text: fullText, section: "" });
            } else {
                for (const sub of splitAtBoundaries(section.content, effective - titlePrefix.length)) {
                    chunks.push({ text: titlePrefix + sub, section: "" });
                }
            }
            continue;
        }

        const headingLine = `## ${section.heading}\n\n`;
        const headingLineCont = `## ${section.heading} (continued)\n\n`;
        const fullText = titlePrefix + headingLine + section.content;

        if (fullText.length <= effective) {
            chunks.push({ text: fullText, section: section.heading });
        } else {
            const subMax = effective - titlePrefix.length - headingLineCont.length;
            const subTexts = splitAtBoundaries(section.content, Math.max(subMax, 200));
            for (let i = 0; i < subTexts.length; i++) {
                const cont = i > 0 ? " (continued)" : "";
                chunks.push({
                    text: titlePrefix + `## ${section.heading}${cont}\n\n` + subTexts[i],
                    section: section.heading,
                });
            }
        }
    }

    if (chunks.length === 0 && markdown.trim()) {
        return splitAtBoundaries(markdown, effective).map(t => ({ text: t, section: "" }));
    }

    return chunks.filter(c => {
        const body = c.text.replace(/^#{1,6}[^\n]*\n/gm, "").replace(/\s/g, "");
        return body.length >= MIN_BODY_CHARS;
    });
}

function splitAtBoundaries(text: string, maxChars: number): string[] {
    if (text.length <= maxChars) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxChars) {
            chunks.push(remaining.trim());
            break;
        }

        let splitAt = remaining.lastIndexOf("\n\n", maxChars);
        if (splitAt < maxChars * 0.4) splitAt = remaining.lastIndexOf("\n", maxChars);
        if (splitAt < maxChars * 0.4) splitAt = remaining.lastIndexOf(". ", maxChars);
        if (splitAt < maxChars * 0.4) splitAt = remaining.lastIndexOf(" ", maxChars);
        if (splitAt <= 0) splitAt = maxChars;

        const chunk = remaining.substring(0, splitAt).trim();
        if (chunk.length > 0) chunks.push(chunk);
        remaining = remaining.substring(splitAt).trim();
    }

    return chunks.filter(c => c.length > 0);
}

export const salesforceKnowledgeConnector = createKnowledgeConnector({
    type: "salesforceKnowledgeConnector",
    label: "Salesforce Knowledge",
    summary: "Imports published Salesforce Knowledge articles into Cognigy Knowledge AI with role-based separation for supervisors and managers",
    fields: [
        {
            key: "oauthConnection",
            label: "Salesforce Connected App",
            type: "connection",
            params: { connectionType: "oauth", required: true }
        },
        {
            key: "knowledgeApiName",
            label: "Knowledge Article Object API Name",
            type: "text",
            defaultValue: "Knowledge_Article__kav",
            description: "The API name of your Salesforce Knowledge Article object, e.g. Knowledge_Article__kav",
            params: { required: true }
        },
        {
            key: "language",
            label: "Language",
            type: "text",
            defaultValue: "en_US",
            description: "Language code to filter published articles, e.g. en_US",
            params: { required: true }
        },
        {
            key: "agentFields",
            label: "Agent Content Fields",
            type: "textArray",
            defaultValue: [
                "Overview__c", "Details__c", "Inclusions__c", "Exclusions__c",
                "Information__c", "Processing_Steps_Text__c", "Questions__c",
                "Answer__c", "Scripting__c", "Actions__c"
            ],
            description: "API names of article fields to include in agent-accessible knowledge.",
            params: { required: true }
        },
        {
            key: "agentTags",
            label: "Agent Knowledge Tags",
            type: "chipInput",
            defaultValue: ["agent"],
            description: "Tags applied to agent knowledge sources. Press ENTER to add a tag."
        },
        {
            key: "supervisorFields",
            label: "Supervisor / Manager Content Fields",
            type: "textArray",
            defaultValue: [
                "Manager_Actions__c", "Manager_information__c",
                "Manager_processing_steps__c", "Manager_scripting__c"
            ],
            description: "Fields with manager-only content. A separate supervisor-tagged source is created per article.",
            params: { required: false }
        },
        {
            key: "supervisorTags",
            label: "Supervisor Knowledge Tags",
            type: "chipInput",
            defaultValue: ["supervisor"],
            description: "Tags applied to supervisor-only knowledge sources. Press ENTER to add a tag."
        },
        {
            key: "syncMode",
            label: "Sync Mode",
            type: "select",
            defaultValue: "full",
            description: "Full: fetch all published articles (recommended — unchanged articles are skipped via content hash). Incremental: only fetch articles modified since Last Sync Date.",
            params: {
                options: [
                    { label: "Full", value: "full" },
                    { label: "Incremental (filter by Last Sync Date)", value: "incremental" }
                ]
            }
        },
        {
            key: "lastSyncDate",
            label: "Last Sync Date",
            type: "text",
            description: "ISO 8601 date for Incremental mode, e.g. 2026-01-01T00:00:00Z. Stale removal is skipped in Incremental mode.",
            params: { required: false }
        }
    ] as const,
    sections: [
        {
            key: "supervisorAccess",
            label: "Supervisor / Manager Access",
            defaultCollapsed: true,
            fields: ["supervisorFields", "supervisorTags"]
        },
        {
            key: "syncSettings",
            label: "Sync Settings",
            defaultCollapsed: true,
            fields: ["syncMode", "lastSyncDate"]
        }
    ],
    form: [
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "knowledgeApiName" },
        { type: "field", key: "language" },
        { type: "field", key: "agentFields" },
        { type: "field", key: "agentTags" },
        { type: "section", key: "supervisorAccess" },
        { type: "section", key: "syncSettings" }
    ],
    function: async ({ config, api, sources }) => {
        const {
            oauthConnection, knowledgeApiName, language,
            agentFields, agentTags, supervisorFields, supervisorTags,
            syncMode, lastSyncDate
        } = config;

        // --- Input validation (prevent SOQL injection) ----------------------
        const apiNameRaw = (knowledgeApiName as string)?.trim() ?? "";
        if (!isValidSfApiName(apiNameRaw)) {
            throw new Error(`[Salesforce KC] Invalid Knowledge Article Object API Name: "${apiNameRaw}". Must match [A-Za-z_][A-Za-z0-9_]*.`);
        }
        const langRaw = (language as string)?.trim() ?? "";
        if (!isValidLanguageCode(langRaw)) {
            throw new Error(`[Salesforce KC] Invalid Language code: "${langRaw}". Expected format e.g. en_US or de.`);
        }

        const salesforceConnection = await authenticate(oauthConnection as IOAuthConnection);

        const agentFieldList = Array.isArray(agentFields) ? (agentFields as string[]) : [];
        const supervisorFieldList = Array.isArray(supervisorFields) ? (supervisorFields as string[]) : [];

        const invalidFields = [...agentFieldList, ...supervisorFieldList].filter(f => !isValidSfApiName(f));
        if (invalidFields.length > 0) {
            throw new Error(`[Salesforce KC] Invalid field API name(s): ${invalidFields.join(", ")}.`);
        }
        if (agentFieldList.length === 0) {
            throw new Error("[Salesforce KC] At least one Agent Content Field is required.");
        }

        const allContentFields = [...new Set([...agentFieldList, ...supervisorFieldList])];

        // Incremental date filter — validate ISO 8601 before embedding in SOQL
        const rawDate = (lastSyncDate as string)?.trim() ?? "";
        const isValidIsoDate = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+\-]+)?$/.test(rawDate);
        if ((syncMode as string) === "incremental" && rawDate && !isValidIsoDate) {
            throw new Error(`[Salesforce KC] Invalid Last Sync Date: "${rawDate}". Expected ISO 8601, e.g. 2026-01-01T00:00:00Z`);
        }
        const dateFilter = (syncMode as string) === "incremental" && isValidIsoDate
            ? `AND LastModifiedDate > ${rawDate}`
            : "";

        const fixedFields = "Id, KnowledgeArticleId, ArticleNumber, Title, UrlName, Language, LastPublishedDate";
        const selectClause = allContentFields.length > 0
            ? `${fixedFields}, ${allContentFields.join(", ")}`
            : fixedFields;

        const soql = [
            `SELECT ${selectClause}`,
            `FROM ${apiNameRaw}`,
            `WHERE PublishStatus = 'Online'`,
            `AND Language = '${langRaw}'`,
            `AND IsLatestVersion = true`,
            dateFilter,
            `ORDER BY Title ASC`
        ].filter(Boolean).join(" ");

        if (dateFilter) {
            console.log(`[Salesforce KC] Incremental mode: articles modified after ${rawDate}`);
        }

        const result = await salesforceConnection.query(soql, { autoFetch: true });
        const articles = result.records;
        console.log(`[Salesforce KC] ${articles.length} article(s) to process`);

        // Track externalIdentifiers created this run — used for stale removal
        const processedIds = new Set<string>();

        for (const article of articles) {
            const title = article.Title || `Article ${article.ArticleNumber}`;
            const articleNumber = String(article.ArticleNumber || "");
            const knowledgeArticleId = String(article.KnowledgeArticleId || "");
            const articleUrl = `${salesforceConnection.instanceUrl}/lightning/articles/${knowledgeArticleId}`;

            // --- Agent Knowledge Source ---
            const agentText = buildArticleText(title, agentFieldList, article);
            const agentBody = agentText.replace(/^#[^\n]*\n?/m, "").trim();
            if (!agentBody) {
                console.log(`[Salesforce KC] Agent has no body content — skipping: ${articleNumber}`);
            } else {
                const agentExternalId = `${articleNumber}:agent`;
                processedIds.add(agentExternalId);
                const agentChunks = chunkArticleMarkdown(agentText);
                const agentHash = shortHash(agentText);

                const agentSource = await api.upsertKnowledgeSource({
                    name: sanitizeSourceName(`[SF:${articleNumber}] ${title}`),
                    description: `Salesforce article ${articleNumber} - agent`,
                    tags: agentTags as string[],
                    chunkCount: agentChunks.length,
                    contentHashOrTimestamp: agentHash,
                    externalIdentifier: agentExternalId
                });

                if (agentSource) {
                    console.log(`[Salesforce KC] Agent: "${title}" (${articleNumber}) — ${agentChunks.length} chunk(s)`);
                    for (const chunk of agentChunks) {
                        const data: Record<string, string> = {
                            articleNumber,
                            role: "agent",
                            url: articleUrl
                        };
                        if (chunk.section) data.section = chunk.section;
                        await api.createKnowledgeChunk({
                            knowledgeSourceId: agentSource.knowledgeSourceId,
                            text: chunk.text,
                            data
                        });
                    }
                } else {
                    console.log(`[Salesforce KC] Agent unchanged — skipping: ${articleNumber}`);
                }
            }

            // --- Supervisor Knowledge Source ---
            const hasSupervisorContent = supervisorFieldList.some(field => {
                const raw = article[field];
                return raw && htmlFieldToMarkdown(String(raw)).length > 0;
            });

            if (hasSupervisorContent) {
                const supervisorText = buildArticleText(title, supervisorFieldList, article);
                const supervisorExternalId = `${articleNumber}:supervisor`;
                processedIds.add(supervisorExternalId);
                const supervisorChunks = chunkArticleMarkdown(supervisorText);
                const supervisorHash = shortHash(supervisorText);

                const supervisorSource = await api.upsertKnowledgeSource({
                    name: sanitizeSourceName(`[SF:${articleNumber}] ${title} - Manager`),
                    description: `Salesforce article ${articleNumber} - supervisor`,
                    tags: supervisorTags as string[],
                    chunkCount: supervisorChunks.length,
                    contentHashOrTimestamp: supervisorHash,
                    externalIdentifier: supervisorExternalId
                });

                if (supervisorSource) {
                    console.log(`[Salesforce KC] Supervisor: "${title}" (${articleNumber}) — ${supervisorChunks.length} chunk(s)`);
                    for (const chunk of supervisorChunks) {
                        const data: Record<string, string> = {
                            articleNumber,
                            role: "supervisor",
                            url: articleUrl
                        };
                        if (chunk.section) data.section = chunk.section;
                        await api.createKnowledgeChunk({
                            knowledgeSourceId: supervisorSource.knowledgeSourceId,
                            text: chunk.text,
                            data
                        });
                    }
                } else {
                    console.log(`[Salesforce KC] Supervisor unchanged — skipping: ${articleNumber}`);
                }
            }
        }

        // --- Stale source removal ---
        // Only run in full sync — in incremental mode we don't have a complete
        // picture of all current articles so can't safely identify stale sources.
        if ((syncMode as string) !== "incremental") {
            for (const source of sources) {
                const extId = source.externalIdentifier || source.name;
                if (!processedIds.has(extId)) {
                    console.log(`[Salesforce KC] Removing stale source: ${source.name}`);
                    try {
                        await api.deleteKnowledgeSource({ knowledgeSourceId: source.knowledgeSourceId });
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        console.warn(`[Salesforce KC] Could not remove stale source ${source.knowledgeSourceId}: ${msg}`);
                    }
                }
            }
        }
    }
});
