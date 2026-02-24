import type { IKnowledge } from "@cognigy/extension-tools";
import { lsExtractor } from "./text_extractor";
import { splitDocs } from "./text_chunker";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { logMessage } from "./utils/logger";

export type ChunkContent = Pick<
    IKnowledge.CreateKnowledgeChunkParams,
    "text" | "data"
>;

const MAX_CHUNKS_PER_FILE = 500;
const SUPPORTED_FILE_TYPES = ['pdf', 'docx', 'txt', 'csv', 'json', 'jsonl', 'md', 'pptx'];

// Download file from SharePoint and extract chunks
export const getSharePointFileChunks = async (
    accessToken: string,
    driveId: string,
    fileId: string,
    fileName: string,
    fileExtension: string
): Promise<ChunkContent[]> => {
    // Skip unsupported file types
    if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
        logMessage(`Skipping unsupported file type: ${fileName}`,
            "sharepoint-connector",
            "info"
        );
        return [];
    }

    // Download file from SharePoint using Graph API
    const downloadUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`;

    const response = await axios.get(downloadUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer',
    });

    const bodyContents = Buffer.from(response.data);

    // Save to temp file (text_extractor needs file path)
    const tempDir = os.tmpdir();
    const tempFileName = `${Date.now()}_${fileName}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    fs.writeFileSync(tempFilePath, bodyContents as any);

    try {
        // Extract text using lsExtractor
        const extractedText = await lsExtractor(fileExtension, tempFilePath);

        // Create document object for LangChain splitter
        const document = {
            pageContent: extractedText,
            metadata: {
                source: fileName,
                fileType: fileExtension,
            }
        };

        // Use LangChain text splitter for proper chunking
        const splitDocuments = await splitDocs([document]);

        // Convert split documents to ChunkContent format
        const chunks: ChunkContent[] = splitDocuments
            .slice(0, MAX_CHUNKS_PER_FILE)
            .map((doc, index) => ({
                text: doc.pageContent,
                data: {
                    title: `${fileName} - Part ${index + 1}`,
                    source: fileName,
                    fileType: fileExtension,
                },
            }));

        return chunks;

    } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore cleanup errors */ }
        }
    }
};

