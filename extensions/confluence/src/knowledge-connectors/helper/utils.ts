import { IKnowledge } from "@cognigy/extension-tools";
type CreateKnowledgeChunkParams = IKnowledge.CreateKnowledgeChunkParams;
type CreateKnowledgeSourceParams = IKnowledge.CreateKnowledgeSourceParams;

import { ConfluenceDataParser } from "./confluenceParser";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";

// Headings less than and equal to this level create new chunks
// (H1,H2 -> new chunks; H3+ -> continue chunk)
const TARGET_HEADING_LEVEL = 2;
const MAX_CHUNK_SIZE = 2000; // Define a maximum chunk size in characters

/**
 * Fetch data of a given page or folder from a Confluence Rest API endpoint and
 * returns a map of knowledge source params with pageId as key.
 */
export const getSources = async (
    confluenceUrl: string,
    auth: { username: string, password: string },
    descendants: boolean,
    sourceTags: string[]
): Promise<{[pageId: string]: CreateKnowledgeSourceParams}> =>
{
    const pageIds: string[] = [];
    // Parse Confluence URL and prepare baseUrl
    const url = new URL(confluenceUrl as string);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Match 'pages/<id>' or 'folder/<id>' in the URL using regex
    const pageMatch = url.pathname.match(/pages\/(\d+)/);
    const folderMatch = url.pathname.match(/folder\/(\d+)/);
    const pageId = pageMatch ? pageMatch[1] : "";
    const folderId = folderMatch ? folderMatch[1] : "";

    // Determine if the URL is for a specific page or a folder
    if (!pageId && !folderId) {
        throw new Error("Invalid Confluence URL: Must contain either a page ID or folder ID");
    }

    let knowledgeSourceData: Record<string, CreateKnowledgeSourceParams> = {};
    if (pageId) {
        const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}`;
        const data = await fetchData(apiUrl, auth);
        const pageTitle = data.title || `Page ID ${pageId}`;
        knowledgeSourceData[pageId] = {
            name: `${pageTitle}`,
            description: `Data from ${pageTitle}`,
            tags: sourceTags as string[],
            chunkCount: 0
        };
    }

    if (descendants || folderId) {
        const apiUrl = folderId === "" ?
            `${baseUrl}/wiki/api/v2/pages/${pageId}/descendants?depth=5&limit=250` :
            `${baseUrl}/wiki/api/v2/folders/${folderId}/descendants?depth=5&limit=250`;

        // Get all child pages under the parent page
        const data = await fetchData(apiUrl, auth);
        if (data.results) {

            // Filter data to only include pages and maps it to CreateKnowledgeSourceParams
            data.results.forEach((item: any) => {
                item.type === "page" && (knowledgeSourceData[item.id] = {
                    name: item.title,
                    description: `Data from ${item.title}`,
                    tags: sourceTags as string[],
                    chunkCount: 0
                });
            });
        }
    }
    return knowledgeSourceData;
}

/**
 * Fetch detail data for given Confluence page ID using Confluence Rest API and
 * convert the data into chunks
 */
export const getChunks = async (
    confluenceUrl: string,
    auth: { username: string, password: string },
    pageId: string,
    sourceName: string,
    knowledgeSourceId: string = ''
): Promise<CreateKnowledgeChunkParams[]> =>
{
    const result: CreateKnowledgeChunkParams[] = [];
    try {
        const url = new URL(confluenceUrl as string);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Validate and parse Confluence URL
        const apiUrl = `${baseUrl}/wiki/api/v2/pages/${pageId}?body-format=storage`;
        const data = await fetchData(apiUrl, auth);
        const xhtml = data.body.storage.value;
        const webLink = data._links.webui;

        // Parse the xhtml data and get headings data containing title, heading hierarchy and content
        const parser = new ConfluenceDataParser(xhtml, sourceName, TARGET_HEADING_LEVEL);
        const headingsData = parser.parse();
        headingsData.forEach(async heading => {
            if (!heading.content)
                return;

            const chunks = await splitTextIntoChunks(heading.content, MAX_CHUNK_SIZE);
            chunks.forEach(chunk => {
                result.push({
                    knowledgeSourceId: knowledgeSourceId,
                    text: sourceName + "\n" + heading.hierarchy + "\n" + chunk.trim(),
                    data: {
                        heading: heading.title,
                        url: `${baseUrl}/wiki${webLink}`
                    },
                });
            });
        });
    } catch (error) {
        throw new Error(`Error processing Confluence source, with page Id: ${pageId}: ${error}`);
    }
    return result;
};


/**
 * Fetches data from a given URL with the specified email and token.
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
