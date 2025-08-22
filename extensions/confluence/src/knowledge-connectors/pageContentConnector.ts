import { createKnowledgeDescriptor } from "@cognigy/extension-tools";
import { ConfluenceDataParser } from "./parser/confluenceParser";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { TKnowledgeSourceEntry, TKnowledgeChunkEntry } from "@cognigy/extension-tools/build/interfaces/descriptor";
import axios from "axios";

// Headings less than and equal to this level create new chunks
// (H1,H2 -> new chunks; H3+ -> continue chunk)
const TARGET_HEADING_LEVEL = 2;
const MAX_CHUNK_SIZE = 2000; // Define a maximum chunk size in characters

export const pageContentConnector = createKnowledgeDescriptor({
    type: "confluenceKnowledgeConnector",
    label: "Confluence",
    summary: "Imports text under each heading from all pages in a Confluence directory",
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
    listSources: async ({ config })  => {
        const { connection, confluenceUrl, descendants, sourceTags } = config;
        const { email, key } = connection as any;

        // Helper to parse Confluence URL and prepare baseUrl
        const url = new URL(confluenceUrl as string);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Match 'pages/<id>' or 'folder/<id>' in the URL using regex
        const pageMatch = url.pathname.match(/pages\/(\d+)/);
        const folderMatch = url.pathname.match(/folder\/(\d+)/);

        const pageId = pageMatch ? pageMatch[1] : "";
        const folderId = folderMatch ? folderMatch[1] : "";

        // Determine if the URL is for a specific page or a folder
        if (!pageId && !folderId) {
            throw new Error("Invalid Confluence URL: Must contain either a page ID (/pages/{id}) or folder ID (/folder/{id})");
        }

        let pagesData: TKnowledgeSourceEntry[] = [];
        if (pageId) {
            const apiUrl = `${baseUrl}/wiki/rest/api/content/${pageId}`;
            const data = await fetchData(apiUrl, email, key);
            const pageTitle = data.title || `Page ID ${pageId}`;
            pagesData = [{
                name: `${pageTitle}`,
                description: `Data from ${pageTitle}`,
                tags: sourceTags as string[],
                data: { pageId: pageId }
            }];
        }

        if (descendants || folderId) {
            const apiUrl = folderId === "" ?
                `${baseUrl}/wiki/api/v2/pages/${pageId}/descendants` :
                `${baseUrl}/wiki/api/v2/folders/${folderId}/descendants`;

            // Get all child pages under the parent page
            const data = await fetchData(apiUrl, email, key);
            if (!data.results || data.results.length === 0) {
                return pagesData;
            }

            // Filter data to only include pages
            pagesData = pagesData.concat(data.results
                .filter((item: any) => item.type === "page")
                .map((page: any) => ({
                    name: page.title,
                    description: `Data from ${page.title}`,
                    tags: sourceTags as string[],
                    data: { pageId: page.id }
                })));
        }
        return pagesData;
    },
    processSource: async ({ config, source }) => {
        const result = [] as TKnowledgeChunkEntry[];
        const { connection, confluenceUrl } = config;
        const { pageId } = source.data as { pageId: string };
        const { email, key } = connection as any;
        try {
            // Validate and parse Confluence URL
            const url = new URL(confluenceUrl as string);
            const baseUrl = `${url.protocol}//${url.host}`;
            const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}?body-format=storage`;
            const data = await fetchData(apiUrl, email, key);
            const xhtml = data.body.storage.value;
            const webLink = data._links.webui;

            // Extract headings and text under each heading as chunks
            const parser = new ConfluenceDataParser(xhtml, source.name, TARGET_HEADING_LEVEL);
            const headingsData =  parser.parse();
            for (const heading of headingsData) {

                // Parse body text with better HTML handling
                const bodyText = heading.result;
                if (bodyText) {
                    const chunks = await splitTextIntoChunks(bodyText, MAX_CHUNK_SIZE);
                    chunks.forEach(chunk => {
                        chunk = source.name + "\n" + heading.hierarchy + "\n" + chunk.trim();
                        if (chunk) {
                            result.push({
                                text: chunk,
                                data: {
                                    heading: heading.title,
                                    url: `${baseUrl}/wiki${webLink}`
                                },
                            });
                        }
                    });
                }
            }
        } catch (error) {
            throw new Error(`Error processing Confluence source, with page Id: ${pageId}: ${error}`);
        }
        return result;
    }
});

/**
 * Fetches data from a given URL with the specified email and token.
 */
const fetchData = async (url: string, email: string, token: string) => {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            headers: {'Content-Type': 'application/json'},
            auth: {username: email, password: token}
        });
        return response.data;
    } catch (error: any) {
        throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
    }
};

/**
 * Splits the given text into chunks of a specified maximum size.
 */
async function splitTextIntoChunks(text: string, maxChunkSize: number): Promise<string[]> {
    const textSplitter = new CharacterTextSplitter({chunkSize: maxChunkSize, chunkOverlap: 0});
    return await textSplitter.splitText(text);
}

