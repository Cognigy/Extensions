import { flattie } from "flattie";
import { jsonToPlainText } from "json-to-plain-text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const MAX_CHUNK_SIZE = 2000;

/**
 * Splits a JSON object into text chunks, removing specified keys and adding a title to each chunk.
 *
 * @param jsonObj - The JSON object to split.
 * @param chunkTitle - The title to prepend to each chunk.
 * @param filterKeys - An array of keys to remove from the JSON object before splitting.
 * @returns A promise that resolves to an array of string chunks.
 */
export const jsonSplit = async (
  jsonObj: any,
  chunkTitle: string,
  filterKeys: string[],
): Promise<string[]> => {
  // Clone the object to avoid mutating the input
  const clonedObj = { ...jsonObj };
  filterKeys?.forEach((key) => {
    delete clonedObj[key];
  });

  const flat = flattie(clonedObj);
  const text = jsonToPlainText(flat, {
    squareBracketsForArray: true,
    spacing: false,
  });
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: MAX_CHUNK_SIZE - chunkTitle.length,
    chunkOverlap: 0,
  });
  const docs = await splitter.createDocuments([text]);

  // Add title and metadata to each chunk
  return docs.map((doc) => chunkTitle + doc.pageContent);
};
