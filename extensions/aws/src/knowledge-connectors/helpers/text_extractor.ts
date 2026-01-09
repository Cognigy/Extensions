import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { JSONLoader, JSONLinesLoader } from 'langchain/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';

import { splitDocs } from './text_chunker';
import { removeUnnecessaryChars } from './utils/removeUnnecessaryChars';
import { logger } from "./utils/logger";
import { convertToUtf8} from "./utils/convertToUtf8";
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

export const lsExtractor = async (type: string, inputFile: string): Promise<string> => {
	let documentLoader;
	switch (type) {
		case "txt":
			documentLoader = new TextLoader(await convertToUtf8(inputFile));
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
			documentLoader = new CSVLoader(await convertToUtf8(inputFile));
			break;

		case "json":
			// possible config: pointer
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/json#using-json-pointer-example
			documentLoader = new JSONLoader(await convertToUtf8(inputFile));
			break;

		case "jsonl":
			// possible config: pointer
			// https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/jsonlines
			documentLoader = new JSONLinesLoader(await convertToUtf8(inputFile), "");
			break;

		case 'md':
			documentLoader = new TextLoader(await convertToUtf8(inputFile));
			break;

		case 'pptx':
			// https://js.langchain.com/docs/integrations/document_loaders/file_loaders/pptx/
			documentLoader = new PPTXLoader(inputFile);
			break;

		default:
			documentLoader = new TextLoader(await convertToUtf8(inputFile));
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