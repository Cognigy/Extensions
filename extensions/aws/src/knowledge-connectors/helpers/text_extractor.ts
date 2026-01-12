import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { JSONLoader, JSONLinesLoader } from 'langchain/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';

import { splitDocs } from './text_chunker';
import { BufferLoader } from 'langchain/document_loaders/fs/buffer';
import { parseOfficeAsync } from 'officeparser';
const DefaultSplitters = {
	"text": "RecursiveCharacterTextSplitter",
	"pdf": "RecursiveCharacterTextSplitter",
	"docx": "RecursiveCharacterTextSplitter",
	"csv": "RecursiveCharacterTextSplitter",
	"json": "RecursiveCharacterTextSplitter",
	"jsonl": "RecursiveCharacterTextSplitter",
	"pptx": "RecursiveCharacterTextSplitter",
	"md": "MarkdownSplitter"
};

export const logger = {
    log: (level: string, context: any, message: string) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
        if (context && Object.keys(context).length > 0) {
            console.log('Context:', JSON.stringify(context, null, 2));
        }
    }
};

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

export const lsExtractor = async (type: string, inputFile: string): Promise<string> => {
	let documentLoader;
	switch (type) {
		case "txt":
			documentLoader = new TextLoader(inputFile);
			break;

		case "pdf":
			// possible config: { splitPage: true }
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
			documentLoader = new PDFLoader(inputFile, { splitPages: false });
			break;

		case "docx":
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/docx
			documentLoader = new DocxLoader(inputFile);
			break;

		case "csv":
			// possible config: columnName
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/csv#usage-extracting-a-single-column
			documentLoader = new CSVLoader(inputFile);
			break;

		case "json":
			// possible config: pointer
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/json#using-json-pointer-example
			documentLoader = new JSONLoader(inputFile);
			break;

		case "jsonl":
			// possible config: pointer
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/jsonlines
			documentLoader = new JSONLinesLoader(inputFile, "");
			break;

		case 'md':
			documentLoader = new TextLoader(inputFile);
			break;

		case 'pptx':
			// https://js.langchain.com/docs/integrations/document_loaders/file_loaders/pptx/
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
		await splitDocs(
			docs,
			DefaultSplitters[type] || "RecursiveCharacterTextSplitter")
	).map((doc) => doc.pageContent);

	// join the paragraphs into the format we want
	const textParagraphs = splitDocuments.join('\n\n');

	logger.log("info", null, "Successfully used langchain to extract content");

	return textParagraphs;
};

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