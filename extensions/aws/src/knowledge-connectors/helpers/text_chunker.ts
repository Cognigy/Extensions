import * as splitters from "@langchain/textsplitters";

import { getMaxChunkSize, langchainDefaultChunkSizeInChars } from "./utils/config";


export async function splitDocs(document: any, defaultSplitter?: string): Promise<any[]> {
	let splitter;

	const splitterToUse = defaultSplitter;
	let chunkSize = getChunkSizeInChars();

	// We check if chunkOverlap was defined, because when chunkOverlap is 0, we do not want to default to 200.
	const chunkOverlap = 0;

	switch (splitterToUse) {
		case "CharacterTextSplitter":
			splitter = new splitters.CharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "MarkdownTextSplitter":
			splitter = new splitters.MarkdownTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "TokenTextSplitter":
			chunkSize = getChunkSizeInTokens();
			splitter = new splitters.TokenTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "RecursiveCharacterTextSplitter":
			splitter = getRecursiveCharacterTextSplitter();
			break;

		default:
			splitter = getRecursiveCharacterTextSplitter();
	}

	const splitParagraphs = await splitter.splitDocuments(document);
	return splitParagraphs;
}

const getChunkSizeInTokens = () => {
	/**
	 * Chunk size in No. of tokens (https://js.langchain.com/docs/modules/indexes/text_splitters/)
	 *
	 * Why chunk size is subtracted by 1000, here?
	 *
	 * With the limit set to say 2000, langchain still creates chunks that are larger than 2000 characters (issues on their end).
	 * This results in errors from service-resources.
	 * This was the case even when decreasing the limit to 1800, does not work and finally decided to make it margined by 1000, so that there is a large enough margin.
	 */
	const chunkMaxSize = getMaxChunkSize() - 1000;
	const chunkSize = chunkMaxSize > 0 ? chunkMaxSize : 1000;

	return chunkSize;
};

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

	// Add ". " to the list of separators to ensure sentences are kept whole when possible
	// However, this may cause the chunks to be larger than chunkSize if a single sentence exceeds chunkSize
	const separators = ["\n\n", "\n", ". ", " ", ""];
	const chunkOverlap = 0;
	const splitter = new splitters.RecursiveCharacterTextSplitter({
		chunkSize,
		separators,
		chunkOverlap,
		keepSeparator: false
	});
	return splitter;
};
	export const splitTextUsingRecursiveCharacterTextSplitter = (text: string) => {
	const splitter = getRecursiveCharacterTextSplitter();

	// Override separators to use default ones, to ensure chunk size limits are respected
	splitter.separators = ["\n\n", "\n", " ", ""];
	return splitter.splitText(text);
};