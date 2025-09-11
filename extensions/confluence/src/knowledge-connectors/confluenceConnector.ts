import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { getPageChunks, getPageIds } from "./helper/utils";

export const confluenceConnector = createKnowledgeConnector({
    type: "confluenceConnector",
    label: "Confluence",
    summary: "Extract text from Confluence pages and creates Knowledge Chunks",
    fields: [
		{
			key: "connection",
			label: "Confluence Connection",
			type: "connection",
			params: {
				connectionType: "confluence",
				required: true
			}
		},
        {
            key: "confluenceUrl",
            label: "Confluence URL",
            type: "text",
            params: { required: true },
            description: "The URL of the Confluence page or folder to import."
        },
        {
            key: "descendants",
            label: "Extract Descendants",
            type: "toggle",
            params: { required: true },
            defaultValue: true,
            description: "Extract all child pages under the parent page. For folders, descendants are always extracted."
        },
        {
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["confluence"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
    ] as const,
    function: async ({ config, api })  => {
        const { connection, confluenceUrl, descendants, sourceTags } = config;
        const {email, key} = connection as {email: string, key: string};
        const auth = { username: email, password: key };

        // Parse Confluence URL and prepare baseUrl
        const url = new URL(confluenceUrl as string);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Fetch all page ids to parse
        const pageIds = await getPageIds(baseUrl, url, auth, descendants);

        // Iterate over each page
        for (const [pageId, pageTitle] of Object.entries(pageIds)) {

            // Fetch chunks for each page
            const chunks = await getPageChunks(baseUrl, auth, pageId, pageTitle);

            // Create knowledge source and add chunks to it
            const { knowledgeSourceId } = await api.createKnowledgeSource({
                name: pageTitle,
                description: `Data from ${pageTitle}`,
                tags: sourceTags,
                chunkCount: chunks.length

            });
            chunks.forEach(async (chunk) => {
                api.createKnowledgeChunk({
                    knowledgeSourceId: knowledgeSourceId,
                    ...chunk
                });
            });
        }
    }
});

