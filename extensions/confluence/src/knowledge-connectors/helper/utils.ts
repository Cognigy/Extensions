import { IKnowledge } from "@cognigy/extension-tools";
import { ConfluenceDataParser } from "./confluenceParser";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";

// Headings less than and equal to this level create new chunks
// (H1,H2 -> new chunks; H3+ -> continue chunk)
const TARGET_HEADING_LEVEL = 2;
const MAX_CHUNK_SIZE = 2000; // Define a maximum chunk size in characters
type ChunkContent = Pick<IKnowledge.CreateKnowledgeChunkParams, 'text' | 'data'>;

/**
 * Fetch list of pages using a Confluence Rest API endpoint and
 * returns a map of pageId => pageTitle
 */
export const getPageIds = async (
    baseUrl: string,
    url: URL,
    auth: { username: string, password: string },
    descendants: boolean,
): Promise<Record<string, string>> => {

    // Match 'pages/<id>' or 'folder/<id>' in the URL
    const pageMatch = url.pathname.match(/pages\/(\d+)/);
    const folderMatch = url.pathname.match(/folder\/(\d+)/);
    const pageId = pageMatch?.[1] ?? "";
    const folderId = folderMatch?.[1] ?? "";
    if (!pageId && !folderId)
        throw new Error("Invalid Confluence URL: Must contain either a page ID or folder ID");

    const pageIds: Record<string, string> = {};
    if (pageId) {
        const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}`;
        const data = await fetchData(apiUrl, auth);
        pageIds[pageId] = data.title;
    }

    // Get all child pages under the parent page or folder
    if (descendants || folderId) {
        const apiUrl = folderId === "" ?
            `${baseUrl}/wiki/api/v2/pages/${pageId}/descendants?depth=5&limit=250` :
            `${baseUrl}/wiki/api/v2/folders/${folderId}/descendants?depth=5&limit=250`;
        const data = await fetchData(apiUrl, auth);
        if (data.results) {
            for (const item of data.results) {
                if (item.type === "page")
                    pageIds[item.id] = item.title;
            }
        }
    }
    return pageIds;
};

/**
 * Fetch detail data for given Confluence page using Confluence Rest API and
 * convert the data into chunks
 */
export const getPageChunks = async (
    baseUrl: string,
    auth: { username: string, password: string },
    pageId: string,
    sourceName: string
): Promise<ChunkContent[]> => {
    const result: ChunkContent[] = [];
    try {
        const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}?body-format=storage`;
        const data = await fetchData(apiUrl, auth);
        const xhtml = data.body.storage.value;
        const webLink = data._links.webui;

        // Parse the xhtml data and get headings data containing title, heading hierarchy and content
        const parser = new ConfluenceDataParser(xhtml, sourceName, TARGET_HEADING_LEVEL);
        const headingsData = await parser.parse();
        for (const heading of headingsData) {
            const chunks = await splitTextIntoChunks(heading.content, MAX_CHUNK_SIZE);
            result.push(...chunks.map(chunk => ({
                text: `${sourceName}\n${heading.hierarchy}\n${chunk.trim()}`,
                data: {
                    heading: heading.title,
                    url: `${baseUrl}/wiki${webLink}`
                }
            })));
        }
    } catch (error) {
        throw new Error(`Error processing Confluence source, with page Id: ${pageId}: ${error}`);
    }
    return result;
};

/**
 * Fetches data from a given URL with the specified username and password.
 */
export const fetchData = async (url: string, auth: { username: string, password: string }) => {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            headers: {'Content-Type': 'application/json'},
            auth: auth
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
    }
};

/**
 * Splits the given text into chunks of a specified maximum size.
 */
export async function splitTextIntoChunks(text: string, maxChunkSize: number): Promise<string[]> {
    const textSplitter = new CharacterTextSplitter({chunkSize: maxChunkSize, chunkOverlap: 0});
    return await textSplitter.splitText(text);
}
