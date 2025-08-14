import { createKnowledgeDescriptor } from "@cognigy/extension-tools";
import { ConfluenceHtmlParser } from "./confluenceParser";

const MAX_CHUNK_SIZE = 2000; // Define a maximum chunk size for text splitting

export const confluenceImport = createKnowledgeDescriptor({
    type: "confluenceKnowledgeConnector",
    label: "Confluence",
    summary: "Imports text under each heading from all pages in a Confluence directory",
    fields: [
        {
            key: "connection",
            label: "Connect to Confluence",
            type: "connection",
            params:{
                connectionType: "api-key",
                required: "true"}
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
            params: { required: true},
            defaultValue: true,
            description: "Extract all child pages under the parent page. For folders, descendants are always extracted."
        },
        {
            key: "source_tag",
            label: "Source Tags",
            type: "chipInput",
            params: { required: false },
            defaultValue: ["confluence"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
    ],
    listSources: async ({ config })  => {
        const startTime = Date.now();
        const { connection, confluenceUrl, descendants, source_tag } = config;

        // Helper to parse Confluence URL and prepare baseUrl
        const url = new URL(confluenceUrl);
        const baseUrl = `${url.protocol}//${url.host}`;
        const headers = getAuthHeaders(connection);

        // Match 'pages/<id>' or 'folder/<id>' in the URL using regex
        const pageMatch = url.pathname.match(/pages\/(\d+)/);
        const folderMatch = url.pathname.match(/folder\/(\d+)/);

        let pageId = pageMatch ? pageMatch[1] : "";
        let folderId = folderMatch ? folderMatch[1] : "";

        // Determine if the URL is for a specific page or a folder
        if (!pageId && !folderId) {
            throw new Error("Invalid Confluence URL: Must contain either a page ID (/pages/{id}) or folder ID (/folder/{id})");
        }

        let page_data = []
        let descendants_data = [];
        if (pageId) {
            const api_url = `${baseUrl}/wiki/rest/api/content/${pageId}`;
            const data = await fetch_data(api_url, headers);
            const pageTitle = data.title || `Page ID ${pageId}`;
            page_data = [{
                name: `${pageTitle}`,
                description: `Data from ${pageTitle}`,
                tags: source_tag,
                data: { pageId: pageId }
            }];
        }

        if (descendants || folderId) {
            let api_url = folderId === "" ?
                `${baseUrl}/wiki/api/v2/pages/${pageId}/descendants` :
                `${baseUrl}/wiki/api/v2/folders/${folderId}/descendants`;

            // Get all child pages under the parent page
            const data = await fetch_data(api_url, headers);
            if (!data.results || data.results.length === 0) {
                return page_data;
            }

            // filter data to only include pages
            descendants_data = data.results
                .filter(item => item.type === "page") // Only include pages, not folders
                .map(page => ({
                    name: page.title,
                    description: `Data from ${page.title}`,
                    tags: source_tag,
                    data: { pageId: page.id }
                }));
        }
        return page_data.concat(descendants_data);
    },
    processSource: async ({ config, source }) => {
        const startTime = Date.now();

        let result = [];
        try {
            const { connection, confluenceUrl } = config;
            const { pageId } = source.data;

            // Validate and parse Confluence URL
            const url = new URL(confluenceUrl);
            const baseUrl = `${url.protocol}//${url.host}`;
            const headers = getAuthHeaders(connection);
            const api_url = `${baseUrl}/wiki/rest/api/content/${pageId}?expand=body.storage`;
            const data = await fetch_data(api_url, headers);
            const html = data.body.storage.value;
            const webLink = data._links.webui;

            // Extract headings and text under each heading
            result = await parse_html(html, baseUrl, webLink, source.name);

        } catch (error) {
            console.error("Error processing source:", error);
            throw error;
        }
        return result;
    }
});

// Helper to prepare auth headers
const getAuthHeaders = (connection) => {
    const apiToken = connection['Api-Token'];
    const email = connection['Email'];
    const authString = Buffer.from(`${email}:${apiToken}`).toString('base64');
    return {
        "Authorization": `Basic ${authString}`,
        "Accept": "application/json"
    };
};

const fetch_data = async (url, headers) => {
    const startTime = Date.now();
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText} for url ${url}`); // Improved error message with URL
    }
    return response.json();
};

async function parse_html(html, baseUrl, webLink, pageName) {
    let targetHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']; // Define the headings levels to extract
    const parser = new ConfluenceHtmlParser(html,
        pageName,
        targetHeadings
    );
    let headings_data =  parser.parse();
    var result = [];
    for (const heading of headings_data) {

        // Parse body text with better HTML handling
        const bodyText = heading.result
        if (bodyText) {
            const chunks = await splitTextIntoChunks(bodyText, MAX_CHUNK_SIZE);
            chunks.forEach(chunk => {
                chunk = pageName + "\n" + heading.hierarchy + "\n" + chunk.trim();
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
    return result
}

async function splitTextIntoChunks(text: string, maxChunkSize: number) {
    if (text.length <= maxChunkSize) {
        return [text];
    }

    const chunks = [];
    const words = text.split(' ');
    let currentChunk = '';

    for (const word of words) {
        const testChunk = currentChunk ? `${currentChunk} ${word}` : word;

        // If adding this word would exceed the limit, save current chunk and start new
        if (testChunk.length > maxChunkSize && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
        } else {
            currentChunk = testChunk;
        }
    }

    // Don't forget the last chunk
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// exports.parse_html = parse_html;