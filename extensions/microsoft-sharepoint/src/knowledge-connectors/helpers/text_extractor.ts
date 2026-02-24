import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { JSONLoader, JSONLinesLoader } from 'langchain/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';

import { splitDocs } from './text_chunker';
import { BufferLoader } from 'langchain/document_loaders/fs/buffer';
import * as fs from 'fs';
import { parseOfficeAsync } from 'officeparser';

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

	// load and extract document (with PDF fallback)
	let docs;
	try {
		docs = await documentLoader.load();
	} catch (err: any) {
		// If PDF loader failed, attempt a lightweight fallback using 'pdf-parse' if available
		if (type === 'pdf') {
			try {
				let pdfParse: any = null;
				try { pdfParse = require('pdf-parse'); } catch (e) { pdfParse = null; }

				if (pdfParse) {
					const buffer = fs.readFileSync(inputFile);
					const parsed = await pdfParse(buffer);
					docs = [
						new Document({
							pageContent: parsed?.text || '',
							metadata: {},
						}),
					];
				} else {
					throw err;
				}
			} catch (fallbackErr: any) {
				const message = `PDF extraction failed: ${err?.message || err}. Fallback error: ${fallbackErr?.message || fallbackErr}`;
				throw new Error(message);
			}
		} else {
			throw err;
		}
	}

	// Clean up text for all file types
	docs.forEach((doc) => {
		doc.pageContent = removeUnnecessaryChars(doc?.pageContent);
	});

	// split document into paragraphs according to specified or default splitter
	const splitDocuments = (
		await splitDocs(docs)
	).map((doc) => doc.pageContent);

	// join the paragraphs into the format we want
	const textParagraphs = splitDocuments.join('\n\n');
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