import { IKnowledge } from "@cognigy/extension-tools";
import { ConfluenceDataParser } from "./confluenceParser";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Headings less than and equal to this level create new chunks
// (H1,H2 -> new chunks; H3+ -> continue chunk)
const TARGET_HEADING_LEVEL = 2;
const MAX_CHUNK_SIZE = 2000; // Define a maximum chunk size in characters
const MAX_DEPTH = 5;
const MAX_LIMIT = 250;

export type ChunkContent = Pick<IKnowledge.CreateKnowledgeChunkParams, 'text' | 'data'>;
export type auth = { username: string, password: string };

/**
 * Fetch list of pages using a Confluence Rest API endpoint and
 * returns a list of page ids and titles.
 */
export const getPages = async (
    baseUrl: string,
    url: URL,
    auth: auth,
    descendants: boolean,
): Promise<{ id: string, title: string }[]> => {

    // Match 'pages/<id>' or 'folder/<id>' in the URL
    const pageMatch = url.pathname.match(/pages\/(\d+)/);
    const folderMatch = url.pathname.match(/folder\/(\d+)/);
    const pageId = pageMatch?.[1] ?? "";
    const folderId = folderMatch?.[1] ?? "";
    if (!pageId && !folderId)
        throw new Error("Invalid Confluence URL: Must contain either a page ID or folder ID");

    const pages: { id: string, title: string }[] = [];
    if (pageId) {
        const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}`;
        const data = await fetchData(apiUrl, auth);
        pages.push({ id: pageId, title: data.title });
    }

    // Get all child pages under the parent page or folder
    if (descendants || folderId) {
        const param = `?depth=${MAX_DEPTH}&limit=${MAX_LIMIT}`;
        let apiUrl = folderId === "" ?
            `${baseUrl}/wiki/api/v2/pages/${pageId}/descendants${param}` :
            `${baseUrl}/wiki/api/v2/folders/${folderId}/descendants${param}`;
        do {
            const data = await fetchData(apiUrl, auth);
            if (data.results) {
                pages.push(...data.results
                    .filter((item: any) => item.type === "page")
                    .map((item: any) => ({ id: item.id, title: item.title }))
                );
            }
            apiUrl = data._links?.next ? `${baseUrl}${data._links.next}` : "";
        } while (apiUrl);
    }
    return pages;
};

/**
 * Fetch detail data for given Confluence page using Confluence Rest API and
 * convert the data into chunks
 */
export const getPageChunks = async (
    baseUrl: string,
    auth: auth,
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
            const title = `${sourceName}\n${heading.hierarchy}`;
            const chunks = await splitTextIntoChunks(heading.content, MAX_CHUNK_SIZE - title.length - 1);
            result.push(...chunks.map(chunk => ({
                text: `${title}\n${chunk.trim()}`,
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
export const fetchData = async (url: string, auth: auth) => {
    const authHeader = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authHeader}`
        }
    });
    if (!response.ok)
        throw new Error(`Failed to fetch data, status: ${response.status} ${response.statusText}`);
    return await response.json();
};

/**
 * Splits the given text into chunks of a specified maximum size.
 */
export async function splitTextIntoChunks(text: string, maxChunkSize: number): Promise<string[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: maxChunkSize, chunkOverlap: 0 });
    return await textSplitter.splitText(text);
}
