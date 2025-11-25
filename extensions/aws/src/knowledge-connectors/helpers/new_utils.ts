import type { IKnowledge } from "@cognigy/extension-tools";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { lsExtractor } from "./text_extractor";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type ChunkContent = Pick<
    IKnowledge.CreateKnowledgeChunkParams,
    "text" | "data"
>;

export type S3Connection = {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
};

const MAX_CHUNKS_PER_FILE = 500; // Limit chunks per file to avoid timeout issues

// Download file from S3 and extract chunks
export const getS3FileChunks = async (
    connection: S3Connection,
    bucketName: string,
    fileKey: string
): Promise<ChunkContent[]> => {
    const s3Client = new S3Client({
        region: connection.region,
        credentials: {
            accessKeyId: connection.accessKeyId,
            secretAccessKey: connection.secretAccessKey,
        },
    });

    console.log(`Downloading file: ${fileKey} from bucket: ${bucketName}`);

    // Download file from S3
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
    });

    const response = await s3Client.send(command);
    const bodyContents = await streamToBuffer(response.Body as any);

    // Save to temp file (text_extractor needs file path)
    const tempDir = os.tmpdir();
    const tempFileName = `${Date.now()}_${path.basename(fileKey)}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    fs.writeFileSync(tempFilePath, bodyContents);
    console.log(`Saved to temp file: ${tempFilePath}`);

    try {
        // Extract text using lsExtractor
        const fileExtension = path.extname(fileKey).slice(1); // Remove the dot
        console.log(`Extracting text from ${fileExtension} file...`);

        const extractedText = await lsExtractor(fileExtension, tempFilePath);

        console.log(`Extracted ${extractedText.length} characters from ${fileKey}`);

        // The lsExtractor returns pre-chunked text separated by \n\n
        // Split into individual chunks
        const chunks: ChunkContent[] = extractedText
            .split('\n\n')
            .filter(chunk => chunk.trim().length > 0)
            .slice(0, MAX_CHUNKS_PER_FILE) // Limit to prevent backend processing issues
            .map((chunk, index) => ({
                text: chunk.trim(),
                data: {
                    title: `${fileKey} - Part ${index + 1}`,
                    source: fileKey,
                    fileType: fileExtension,
                },
            }));

        console.log(`Created ${chunks.length} chunks from ${fileKey}`);
        return chunks;

    } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Cleaned up temp file: ${tempFilePath}`);
        }
    }
};

// Helper to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}