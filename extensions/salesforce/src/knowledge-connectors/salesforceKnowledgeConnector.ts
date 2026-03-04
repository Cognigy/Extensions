import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";
import {
    deleteKnowledgeSourceById,
    listKnowledgeSources,
} from "./cognigyManagementApi";

interface IOAuthConnection {
    consumerKey: string;
    consumerSecret: string;
    instanceUrl: string;
}

/**
 * Remove null bytes and non-printable control characters that can cause
 * embedding/store failures. Preserves standard whitespace (newline, tab).
 */
function sanitizeText(text: string): string {
    if (!text) return "";
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

/**
 * Convert HTML from a Salesforce field to Markdown.
 * Heading levels are shifted down by fieldDepth so the field-label heading
 * (## FieldName) sits above any headings that were inside the HTML content.
 *
 * e.g. fieldDepth=2: <h1> → ###, <h2> → ####, <h3> → #####
 */
function htmlFieldToMarkdown(html: string, fieldDepth: number = 2): string {
    if (!html) return "";

    const shiftedH = (level: number) => "#".repeat(Math.min(level + fieldDepth, 6));
    const stripInner = (s: string) => s.replace(/<[^>]+>/g, "").trim();

    const md = html
        // Headings — shift down by fieldDepth
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `${shiftedH(1)} ${stripInner(t)}\n\n`)
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `${shiftedH(2)} ${stripInner(t)}\n\n`)
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `${shiftedH(3)} ${stripInner(t)}\n\n`)
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `${shiftedH(4)} ${stripInner(t)}\n\n`)
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `${shiftedH(5)} ${stripInner(t)}\n\n`)
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `${shiftedH(6)} ${stripInner(t)}\n\n`)
        // Bold / italic
        .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")
        .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "_$2_")
        // Lists
        .replace(/<ul[^>]*>/gi, "").replace(/<\/ul>/gi, "\n")
        .replace(/<ol[^>]*>/gi, "").replace(/<\/ol>/gi, "\n")
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${stripInner(t)}\n`)
        // Tables — simple pipe format
        .replace(/<table[^>]*>/gi, "\n").replace(/<\/table>/gi, "\n")
        .replace(/<t(?:head|body|foot)[^>]*>/gi, "").replace(/<\/t(?:head|body|foot)>/gi, "")
        .replace(/<tr[^>]*>/gi, "").replace(/<\/tr>/gi, " |\n")
        .replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, (_, t) => `| **${stripInner(t)}** `)
        .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, (_, t) => `| ${stripInner(t)} `)
        // Block elements
        .replace(/<\/p>/gi, "\n\n").replace(/<p[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n").replace(/<div[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        // Links — keep visible text only
        .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
        // Strip remaining tags
        .replace(/<[^>]+>/g, "")
        // HTML entities
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&[a-z]+;/gi, " ")
        // Normalise whitespace
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return sanitizeText(md);
}

/**
 * Sanitize a string for use as a Cognigy knowledge source name.
 */
function sanitizeSourceName(name: string): string {
    return name
        .replace(/\u2013|\u2014/g, "-")
        .replace(/&/g, "and")
        .replace(/[/?!:()#*+<>=^~%@\\]/g, " ")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/-{2,}/g, "-")
        .trim();
}

/**
 * Build a Markdown document from a Salesforce article's fields.
 *
 * Structure:
 *   # Article Title
 *   <summary paragraph>
 *   ## Field Label
 *   <field content as markdown>
 *   ## Next Field Label
 *   ...
 */
function buildArticleText(title: string, summary: string, fields: string[], article: any): string {
    const sections: string[] = [];

    if (title) sections.push(`# ${sanitizeText(title)}`);

    if (summary) {
        const summaryMd = htmlFieldToMarkdown(summary, 1);
        if (summaryMd) sections.push(summaryMd);
    }

    for (const field of fields) {
        const raw = article[field];
        if (!raw) continue;
        const content = htmlFieldToMarkdown(String(raw), 2);
        if (!content) continue;
        // Convert API name to a readable label: Manager_Actions__c → Manager Actions
        const label = field.replace(/__c$/i, "").replace(/_/g, " ");
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
    /** Full chunk text sent to Cognigy (includes title prefix + section heading). */
    text: string;
    /** Section heading for the chunk metadata field. */
    section: string;
}

/**
 * Split article Markdown into RAG-optimised chunks.
 *
 * Splits at H2 (field-level) boundaries only; every chunk is prefixed with
 * the article's H1 title so the LLM always has article context.
 * Long H2 sections are further split at paragraph → sentence boundaries.
 */
function chunkArticleMarkdown(markdown: string, maxChars: number = 1800): ArticleChunk[] {
    const effective = Math.min(maxChars, HARD_MAX_CHARS);

    // Extract the H1 title to use as a prefix in every chunk
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const titlePrefix = titleMatch ? `# ${titleMatch[1].trim()}\n\n` : "";

    // --- Parse markdown into H1/H2 sections only ---------------------------
    // H3+ headings (internal field structure) are kept as content, not split points.
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
        // Lines before the first heading are ignored (empty for well-formed docs)
    }
    if (started) {
        sections.push({ level: curLevel, heading: curHeading, content: curLines.join("\n").trim() });
    }

    const chunks: ArticleChunk[] = [];

    for (const section of sections) {
        // H1 section: title is already in titlePrefix; use content (summary) directly
        if (section.level === 1) {
            if (!section.content.trim()) continue;
            const fullText = titlePrefix + section.content;
            if (fullText.length <= effective) {
                chunks.push({ text: fullText, section: "" });
            } else {
                const subTexts = splitAtBoundaries(section.content, effective - titlePrefix.length);
                for (const sub of subTexts) {
                    chunks.push({ text: titlePrefix + sub, section: "" });
                }
            }
            continue;
        }

        // H2 section: field-level chunk
        const headingLine = `## ${section.heading}\n\n`;
        const fullText = titlePrefix + headingLine + section.content;

        if (fullText.length <= effective) {
            chunks.push({ text: fullText, section: section.heading });
        } else {
            const subMax = effective - titlePrefix.length - headingLine.length;
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

    // If parsing produced nothing (article has no headings), fall back to plain split
    if (chunks.length === 0 && markdown.trim()) {
        return splitAtBoundaries(markdown, effective).map(t => ({ text: t, section: "" }));
    }

    // Filter out chunks with no meaningful prose content
    return chunks.filter(c => {
        const body = c.text
            .replace(/^#{1,6}[^\n]*\n/gm, "")
            .replace(/\s/g, "");
        return body.length >= MIN_BODY_CHARS;
    });
}

/**
 * Split text at natural boundaries (paragraph → newline → sentence → word).
 */
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
            params: {
                connectionType: "oauth",
                required: true
            }
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
                "Overview__c",
                "Details__c",
                "Inclusions__c",
                "Exclusions__c",
                "Information__c",
                "Processing_Steps_Text__c",
                "Questions__c",
                "Answer__c",
                "Scripting__c",
                "Actions__c"
            ],
            description: "API names of article fields to include in agent-accessible knowledge. Content from these fields will be indexed for all agent flows.",
            params: { required: true }
        },
        {
            key: "agentTags",
            label: "Agent Knowledge Tags",
            type: "chipInput",
            defaultValue: ["agent"],
            description: "Tags applied to agent knowledge sources. Agent Copilot should filter by this tag. Supervisor Copilot should filter by both this tag and the supervisor tag to see all content. Press ENTER to add a tag."
        },
        {
            key: "supervisorFields",
            label: "Supervisor / Manager Content Fields",
            type: "textArray",
            defaultValue: [
                "Manager_Actions__c",
                "Manager_information__c",
                "Manager_processing_steps__c",
                "Manager_scripting__c"
            ],
            description: "API names of fields containing manager or supervisor-only content. A separate knowledge source tagged for supervisors will be created for each article that has content in these fields.",
            params: { required: false }
        },
        {
            key: "supervisorTags",
            label: "Supervisor Knowledge Tags",
            type: "chipInput",
            defaultValue: ["supervisor"],
            description: "Tags applied to supervisor-only knowledge sources. Supervisor Copilot should filter by both this tag and the agent tag to see full article content including manager sections. Press ENTER to add a tag."
        },
        {
            key: "syncMode",
            label: "Sync Mode",
            type: "select",
            defaultValue: "full",
            description: "Full: import all published articles. Incremental: only import articles modified since Last Sync Date.",
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
            description: "ISO 8601 date used as a filter in Incremental mode, e.g. 2026-01-01T00:00:00Z. Only articles modified after this date will be imported.",
            params: { required: false }
        },
        {
            key: "cognigyApiUrl",
            label: "Cognigy API URL",
            type: "text",
            description: "Base URL of your Cognigy.AI instance, e.g. https://app.cognigy.ai — required for stale article removal.",
            params: { required: false }
        },
        {
            key: "cognigyApiKey",
            label: "Cognigy API Key",
            type: "text",
            description: "API key from Profile → API Keys in Cognigy.AI — required for stale article removal.",
            params: { required: false }
        },
        {
            key: "knowledgeStoreId",
            label: "Knowledge Store ID",
            type: "text",
            description: "The ID of the target knowledge store (visible in the store URL in Cognigy.AI) — required for stale article removal.",
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
            fields: ["syncMode", "lastSyncDate", "cognigyApiUrl", "cognigyApiKey", "knowledgeStoreId"]
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
    function: async ({ config, api }) => {
        const {
            oauthConnection,
            knowledgeApiName,
            language,
            agentFields,
            agentTags,
            supervisorFields,
            supervisorTags,
            syncMode,
            lastSyncDate,
            cognigyApiUrl,
            cognigyApiKey,
            knowledgeStoreId
        } = config;

        const salesforceConnection = await authenticate(oauthConnection as IOAuthConnection);

        // Combine all content fields for a single SOQL query, deduplicated
        const allContentFields = [...new Set([
            ...(agentFields as string[]),
            ...(supervisorFields as string[])
        ])];

        // Incremental date filter
        const dateFilter = (syncMode as string) === "incremental" && (lastSyncDate as string)?.trim()
            ? `AND LastModifiedDate > ${(lastSyncDate as string).trim()}`
            : "";

        const soql = [
            `SELECT Id, KnowledgeArticleId, ArticleNumber, Title, Summary, UrlName,`,
            `Language, LastPublishedDate, ${allContentFields.join(", ")}`,
            `FROM ${knowledgeApiName}`,
            `WHERE PublishStatus = 'Online'`,
            `AND Language = '${language}'`,
            `AND IsLatestVersion = true`,
            dateFilter,
            `ORDER BY Title ASC`
        ].filter(Boolean).join(" ");

        if (dateFilter) {
            console.log(`[Salesforce KC] Incremental mode: fetching articles modified after ${(lastSyncDate as string).trim()}`);
        }

        const result = await salesforceConnection.query(soql, { autoFetch: true });
        const articles = result.records;
        console.log(`[Salesforce KC] ${articles.length} article(s) to process`);

        for (const article of articles) {
            const title = article.Title || `Article ${article.ArticleNumber}`;
            const summary = article.Summary || "";

            const articleMeta = {
                articleId: String(article.Id || ""),
                articleNumber: String(article.ArticleNumber || ""),
                knowledgeArticleId: String(article.KnowledgeArticleId || ""),
                urlName: String(article.UrlName || ""),
                language: String(article.Language || language),
                lastPublishedDate: String(article.LastPublishedDate || "")
            };

            const articleUrl = `${salesforceConnection.instanceUrl}/lightning/articles/${articleMeta.knowledgeArticleId}`;

            // --- Agent Knowledge Source ---
            const agentText = buildArticleText(title, summary, agentFields as string[], article);
            const agentChunks = chunkArticleMarkdown(agentText);

            if (agentChunks.length > 0) {
                console.log(`[Salesforce KC] Agent: "${title}" (${articleMeta.articleNumber}) — ${agentChunks.length} chunk(s)`);
                const { knowledgeSourceId: agentSourceId } = await api.createKnowledgeSource({
                    name: sanitizeSourceName(`[${articleMeta.articleNumber}] ${title}`),
                    tags: agentTags as string[],
                    chunkCount: agentChunks.length
                });

                for (let i = 0; i < agentChunks.length; i++) {
                    console.log(`[Salesforce KC] Agent chunk ${i + 1}/${agentChunks.length} for "${title}"`);
                    await api.createKnowledgeChunk({
                        knowledgeSourceId: agentSourceId,
                        text: agentChunks[i].text,
                        data: {
                            articleNumber: articleMeta.articleNumber,
                            role: "agent",
                            section: agentChunks[i].section || null,
                            url: articleUrl
                        }
                    });
                }
            }

            // --- Supervisor Knowledge Source ---
            const hasSupervisorContent = (supervisorFields as string[]).some(field => {
                const raw = article[field];
                return raw && htmlFieldToMarkdown(String(raw)).length > 0;
            });

            if (hasSupervisorContent) {
                const supervisorText = buildArticleText(title, summary, supervisorFields as string[], article);
                const supervisorChunks = chunkArticleMarkdown(supervisorText);

                if (supervisorChunks.length > 0) {
                    console.log(`[Salesforce KC] Supervisor: "${title}" (${articleMeta.articleNumber}) — ${supervisorChunks.length} chunk(s)`);
                    const { knowledgeSourceId: supervisorSourceId } = await api.createKnowledgeSource({
                        name: sanitizeSourceName(`[${articleMeta.articleNumber}] ${title} - Manager`),
                        tags: supervisorTags as string[],
                        chunkCount: supervisorChunks.length
                    });

                    for (let i = 0; i < supervisorChunks.length; i++) {
                        console.log(`[Salesforce KC] Supervisor chunk ${i + 1}/${supervisorChunks.length} for "${title}"`);
                        await api.createKnowledgeChunk({
                            knowledgeSourceId: supervisorSourceId,
                            text: supervisorChunks[i].text,
                            data: {
                                articleNumber: articleMeta.articleNumber,
                                role: "supervisor",
                                section: supervisorChunks[i].section || null,
                                url: articleUrl
                            }
                        });
                    }
                }
            }
        }

        // --- Stale article removal ---
        const removalEnabled =
            (cognigyApiUrl as string)?.trim() &&
            (cognigyApiKey as string)?.trim() &&
            (knowledgeStoreId as string)?.trim();

        if (removalEnabled) {
            console.log("[Salesforce KC] Checking for stale sources to remove…");
            try {
                const existingSources = await listKnowledgeSources(
                    (cognigyApiUrl as string).trim(),
                    (cognigyApiKey as string).trim(),
                    (knowledgeStoreId as string).trim(),
                );

                const sfSources = existingSources.filter(s => /^\[([^\]]+)\]/.test(s.name));
                if (sfSources.length === 0) {
                    console.log("[Salesforce KC] No Salesforce-pattern sources found in store — skipping stale check");
                } else {
                    const articleNumbers = [
                        ...new Set(
                            sfSources
                                .map(s => {
                                    const m = s.name.match(/^\[([^\]]+)\]/);
                                    return m ? m[1] : null;
                                })
                                .filter(Boolean) as string[]
                        )
                    ];

                    console.log(`[Salesforce KC] Verifying ${articleNumbers.length} unique article number(s) in Salesforce…`);

                    const inClause = articleNumbers.map(n => `'${n}'`).join(", ");
                    const checkSoql = `SELECT ArticleNumber FROM ${knowledgeApiName} WHERE ArticleNumber IN (${inClause}) AND PublishStatus = 'Online' AND IsLatestVersion = true`;
                    const checkResult = await salesforceConnection.query(checkSoql, { autoFetch: true });
                    const activeNumbers = new Set(
                        checkResult.records.map((r: any) => String(r.ArticleNumber))
                    );

                    for (const src of sfSources) {
                        const m = src.name.match(/^\[([^\]]+)\]/);
                        const articleNumber = m ? m[1] : null;
                        if (articleNumber && !activeNumbers.has(articleNumber)) {
                            console.log(`[Salesforce KC] Removing stale source "${src.name}" (article ${articleNumber} no longer active)`);
                            try {
                                await deleteKnowledgeSourceById(
                                    (cognigyApiUrl as string).trim(),
                                    (cognigyApiKey as string).trim(),
                                    (knowledgeStoreId as string).trim(),
                                    src._id,
                                );
                            } catch (err) {
                                const msg = err instanceof Error ? err.message : String(err);
                                console.warn(`[Salesforce KC] Could not remove stale source ${src._id}: ${msg}`);
                            }
                        }
                    }
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`[Salesforce KC] Stale removal skipped due to error: ${msg}`);
            }
        }
    }
});
