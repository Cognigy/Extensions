import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

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
        .replace(/<li[^>]*>/gi, "• ")
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
    // Remove null bytes and ASCII control characters except \t (9), \n (10), \r (13)
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

/**
 * Split long text into chunks at natural boundaries (paragraphs → sentences → words).
 */
function chunkContent(text: string, maxSize: number = 800): string[] {
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
        }
    ] as const,
    sections: [
        {
            key: "supervisorAccess",
            label: "Supervisor / Manager Access",
            defaultCollapsed: true,
            fields: ["supervisorFields", "supervisorTags"]
        }
    ],
    form: [
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "knowledgeApiName" },
        { type: "field", key: "language" },
        { type: "field", key: "agentFields" },
        { type: "field", key: "agentTags" },
        { type: "section", key: "supervisorAccess" }
    ],
    function: async ({ config, api }) => {
        const {
            oauthConnection,
            knowledgeApiName,
            language,
            agentFields,
            agentTags,
            supervisorFields,
            supervisorTags
        } = config;

        const salesforceConnection = await authenticate(oauthConnection as IOAuthConnection);

        // Combine all content fields for a single SOQL query, deduplicated
        const allContentFields = [...new Set([
            ...(agentFields as string[]),
            ...(supervisorFields as string[])
        ])];

        const soql = [
            `SELECT Id, KnowledgeArticleId, ArticleNumber, Title, Summary, UrlName,`,
            `Language, LastPublishedDate, ${allContentFields.join(", ")}`,
            `FROM ${knowledgeApiName}`,
            `WHERE PublishStatus = 'Online'`,
            `AND Language = '${language}'`,
            `AND IsLatestVersion = true`,
            `ORDER BY Title ASC`
        ].join(" ");

        const result = await salesforceConnection.query(soql, { autoFetch: true });
        const articles = result.records;

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
                    name: `[${articleMeta.articleNumber}] ${title}`,
                    tags: agentTags as string[],
                    chunkCount: agentChunks.length
                });

                for (let i = 0; i < agentChunks.length; i++) {
                    console.log(`[Salesforce KC] Agent chunk ${i + 1}/${agentChunks.length} for "${title}"`);
                    await api.createKnowledgeChunk({
                        knowledgeSourceId: agentSourceId,
                        text: agentChunks[i],
                        data: { ...articleMeta, role: "agent" }
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
                        name: `[${articleMeta.articleNumber}] ${title} — Manager`,
                        tags: supervisorTags as string[],
                        chunkCount: supervisorChunks.length
                    });

                    for (let i = 0; i < supervisorChunks.length; i++) {
                        console.log(`[Salesforce KC] Supervisor chunk ${i + 1}/${supervisorChunks.length} for "${title}"`);
                        await api.createKnowledgeChunk({
                            knowledgeSourceId: supervisorSourceId,
                            text: supervisorChunks[i],
                            data: { ...articleMeta, role: "supervisor" }
                        });
                    }
                }
            }
        }
    }
});
