import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { JSONLoader, JSONLinesLoader } from '@langchain/classic/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';

import { splitDocs } from './textChunker';
import { BufferLoader } from '@langchain/classic/document_loaders/fs/buffer';
import { parseOfficeAsync } from 'officeparser';

/**
 * Custom PPTXLoader class to handle pptx files. Implementation adapted
 * from langchain's PPTXLoader, but it uses newer version of officeparser package
 * to handle pptx entirely in memory, instead of writing to a temp file in the
 * current directory.
 */
class PPTXLoader extends BufferLoader {
	constructor(filePathOrBlob: string | Blob) {
		super(filePathOrBlob);
	}

	async parse(raw: Buffer, metadata: Record<string, any>): Promise<Document[]> {
		const pptx = await parseOfficeAsync(raw, {
			outputErrorToConsole: true,
		});
		if (!pptx)
			return [];
		return [
			new Document({
				pageContent: pptx,
				metadata,
			}),
		];
	}
}

export const removeUnnecessaryChars = (text: string): string => {
    if (!text) return "";

    return text
        // Remove multiple spaces but preserve newlines
        .replace(/[ \t]+/g, ' ')
        // Remove multiple newlines (keep max 2)
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Trim whitespace
        .trim();
};

export const lsExtractor = async (type: string, inputFile: string): Promise<string[]> => {
	let documentLoader;
	switch (type) {
		case "txt":
			documentLoader = new TextLoader(inputFile);
			break;

		case "pdf":
			documentLoader = new PDFLoader(inputFile, { splitPages: false });
			break;

		case "docx":
			documentLoader = new DocxLoader(inputFile);
			break;

		case "csv":
			documentLoader = new CSVLoader(inputFile);
			break;

		case "json":
			documentLoader = new JSONLoader(inputFile);
			break;

		case "jsonl":
			documentLoader = new JSONLinesLoader(inputFile, "");
			break;

		case 'md':
			documentLoader = new TextLoader(inputFile);
			break;

		case 'pptx':
			documentLoader = new PPTXLoader(inputFile);
			break;

		default:
			documentLoader = new TextLoader(inputFile);
	}

	// load and extract document
	const docs = await documentLoader.load();

	// Clean up text for all file types
	docs.forEach((doc) => {
		doc.pageContent = removeUnnecessaryChars(doc?.pageContent);
	});

	// split document into paragraphs according to specified or default splitter
	const splitDocuments = (
		await splitDocs(docs)
	).map((doc) => doc.pageContent);

	// join the paragraphs into the format we want
	return splitDocuments;
}
