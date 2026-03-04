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
 * Strip HTML tags and decode entities into plain readable text.
 * Preserves structure for tables (pipe-separated) and lists (bullet points).
 */
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

/**
 * Remove null bytes and non-printable control characters that can cause
 * embedding/store failures. Preserves standard whitespace (newline, tab).
 */
function sanitizeText(text: string): string {
    if (!text) return "";
    // Remove control characters, then strip any remaining non-ASCII (>127) to avoid
    // vector store rejection of unusual Unicode characters from HTML stripping.
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

/**
 * Split long text into chunks at natural boundaries (paragraphs → sentences → words).
 */
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

/**
 * Sanitize a string for use as a Cognigy knowledge source name.
 * Cognigy enforces a resource-name format: replaces/removes characters
 * outside of letters, numbers, spaces, hyphens, and square brackets.
 */
function sanitizeSourceName(name: string): string {
    return name
        .replace(/\u2013|\u2014/g, "-")   // en dash, em dash → hyphen
        .replace(/&/g, "and")              // & → and
        .replace(/[/?!:()#*+<>=^~%@\\]/g, " ")  // special chars → space
        .replace(/[ \t]{2,}/g, " ")        // collapse multiple spaces
        .replace(/-{2,}/g, "-")            // collapse multiple hyphens
        .trim();
}

/**
 * Build readable plain text from a set of article fields.
 * Each non-empty field is prefixed with a human-readable label.
 */
function buildArticleText(title: string, summary: string, fields: string[], article: any): string {
    const sections: string[] = [];

    if (title) sections.push(`# ${sanitizeText(title)}`);
    if (summary) sections.push(sanitizeText(stripHtml(summary)));

    for (const field of fields) {
        const raw = article[field];
        if (!raw) continue;
        const content = sanitizeText(stripHtml(String(raw)));
        if (!content) continue;
        // Convert field API name to a readable label: Manager_Actions__c → Manager Actions
        const label = field.replace(/__c$/i, "").replace(/_/g, " ");
        sections.push(`${label}:\n${content}`);
    }

    return sections.join("\n\n");
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

            // --- Agent Knowledge Source ---
            const agentText = buildArticleText(title, summary, agentFields as string[], article);
            const agentChunks = chunkContent(agentText);

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
                        text: agentChunks[i],
                        data: {
                            articleNumber: articleMeta.articleNumber,
                            role: "agent",
                            url: `${salesforceConnection.instanceUrl}/lightning/articles/${articleMeta.knowledgeArticleId}`
                        }
                    });
                }
            }

            // --- Supervisor Knowledge Source ---
            // Only created if at least one supervisor field has actual content
            const hasSupervisorContent = (supervisorFields as string[]).some(field => {
                const raw = article[field];
                return raw && sanitizeText(stripHtml(String(raw))).length > 0;
            });

            if (hasSupervisorContent) {
                const supervisorText = buildArticleText(title, summary, supervisorFields as string[], article);
                const supervisorChunks = chunkContent(supervisorText);

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
                            text: supervisorChunks[i],
                            data: {
                                articleNumber: articleMeta.articleNumber,
                                role: "supervisor",
                                url: `${salesforceConnection.instanceUrl}/lightning/articles/${articleMeta.knowledgeArticleId}`
                            }
                        });
                    }
                }
            }
        }

        // --- Stale article removal ---
        // Requires Management API credentials; only meaningful when running a full sync.
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

                // Filter to sources that were created by this KC (have [ArticleNumber] prefix)
                const sfSources = existingSources.filter(s => /^\[([^\]]+)\]/.test(s.name));
                if (sfSources.length === 0) {
                    console.log("[Salesforce KC] No Salesforce-pattern sources found in store — skipping stale check");
                } else {
                    // Extract unique article numbers from source names
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

                    // Batch query Salesforce to find still-active articles
                    const inClause = articleNumbers.map(n => `'${n}'`).join(", ");
                    const checkSoql = `SELECT ArticleNumber FROM ${knowledgeApiName} WHERE ArticleNumber IN (${inClause}) AND PublishStatus = 'Online' AND IsLatestVersion = true`;
                    const checkResult = await salesforceConnection.query(checkSoql, { autoFetch: true });
                    const activeNumbers = new Set(
                        checkResult.records.map((r: any) => String(r.ArticleNumber))
                    );

                    // Delete sources whose article numbers are no longer active
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
