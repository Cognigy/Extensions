import { jsonToPlainText } from "json-to-plain-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const MAX_CHUNK_SIZE = 2000;

export const simpleSplit = async (jsonObj: any): Promise<String[]> => {
    const chunks: String[] = [];
    const chunkTitle = `title: ${jsonObj.objects[0].title}\n` +
        `type: ${jsonObj.objects[0].type}\n` +
        `url: ${jsonObj.request.pageUrl}\n\n`;

    // Flatten the JSON object and convert to plain text
    const utils = require('@appveen/json-utils').ObjectUtils;
    const flat = utils.flatten(jsonObj.objects[0]);
    const text = jsonToPlainText(flat, { squareBracketsForArray: true });

    // Initialize the text splitter. 1500 token max chunk size,
    // remaining 500 reserved for chunk Title and metadata
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1500,
        chunkOverlap: 1,
    });
    const docs = await splitter.createDocuments([text]);

    // Add title and metadata to each chunk and ensure it does not exceed MAX_CHUNK_SIZE
    chunks.push(...docs.map((doc: any) => {
        return (chunkTitle + doc.pageContent).slice(0, MAX_CHUNK_SIZE);
    }));

    return chunks;
};

