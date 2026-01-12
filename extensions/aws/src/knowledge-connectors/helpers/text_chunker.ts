import * as splitters from "@langchain/textsplitters";

import { getMaxChunkSize, langchainDefaultChunkSizeInChars } from "./utils/config";


export async function splitDocs(document: any): Promise<any[]> {
	let splitter;
	splitter = getRecursiveCharacterTextSplitter();
	const splitParagraphs = await splitter.splitDocuments(document);
	return splitParagraphs;
}

const getChunkSizeInChars = () => {
	// Langchain has issues and creates chunks larger than the limit set.
	// Therefore a margin is added to chunk size
	const margin = 400;
	const chunkMaxSize = Math.min(langchainDefaultChunkSizeInChars(), getMaxChunkSize()) - margin;
	const chunkSize = chunkMaxSize > 0 ? chunkMaxSize : 1800;
	return chunkSize;
};

const getRecursiveCharacterTextSplitter = () => {
	const chunkSize = getChunkSizeInChars();
	const chunkOverlap = 0;
	const splitter = new splitters.RecursiveCharacterTextSplitter({
		chunkSize,
		chunkOverlap,
		keepSeparator: false
	});
	return splitter;
};
export const splitTextUsingRecursiveCharacterTextSplitter = (text: string) => {
	const splitter = getRecursiveCharacterTextSplitter();

	// Override separators to use default ones, to ensure chunk size limits are respected
	// splitter.separators = ["\n\n", "\n", " ", ""];
	return splitter.splitText(text);
};