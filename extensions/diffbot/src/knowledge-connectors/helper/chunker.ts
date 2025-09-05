import { jsonToPlainText } from "json-to-plain-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { flattie } from 'flattie';

const MAX_CHUNK_SIZE = 2000;

export const jsonSplit = async (jsonObj: any, chunkTitle: string, filterKeys: string[]): Promise<string[]> => {

    // Remove unwanted keys
    filterKeys?.forEach(key => delete jsonObj[key]);

    const chunks: string[] = [];
    const flat = flattie(jsonObj);
    const text = jsonToPlainText(flat, { squareBracketsForArray: true });
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: MAX_CHUNK_SIZE - chunkTitle.length,
        chunkOverlap: 1,
    });
    const docs = await splitter.createDocuments([text]);

    // Add title and metadata to each chunk
    chunks.push(...docs.map((doc: Document) => {
        return (chunkTitle + doc.pageContent)
    }));

    return chunks;
};


