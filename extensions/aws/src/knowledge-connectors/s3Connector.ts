import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { getS3Object } from "./helpers/list_files";
import { getS3FileChunks, S3Connection } from "./helpers/chunk_extractor";
import * as crypto from "crypto";
export const s3Connector = createKnowledgeConnector({
  type: "s3connector",
  label: "S3 Connector",
  summary: "Creates Knowledge Sources based on information extracted from AWS S3.",
  fields: [
    {
      key: "connection",
      label: "AWS Connection",
      type: "connection",
      params: {
        connectionType: "aws",
        required: true,
      },
    },
    {
      key: "bucketName",
      label: "Name of your S3 Bucket",
      type: "text",
      params: { required: true },
      description: "The name of the S3 bucket you want to connect to.",
    },
    {
      key: "sourceTags",
      label: "Source Tags",
      type: "chipInput",
      defaultValue: ["s3"],
      description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
    },
  ] as const,

  function: async ({ config, api, sources }) => {
    const { connection, bucketName, sourceTags } = config;

    // Hash all chunks
    function createContentHash(chunks: { text: string }[]): string {
      const content = chunks.map((c) => c.text).join("");
      return crypto.createHash("sha256").update(content).digest("hex");
    }

    // Extract AWS credentials from connection
    const { accessKeyId, secretAccessKey, region } = connection as {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };

    const s3Connection: S3Connection = {
      accessKeyId,
      secretAccessKey,
      region,
    };

    const newsourceIds: string[] = [];
    // Get all S3 objects in the bucket
    const s3Objects = await getS3Object(s3Connection, bucketName);

    // Filter for supported file types
    const supportedExtensions = ['txt', 'pdf', 'docx', 'csv', 'json', 'jsonl', 'md', 'pptx'];
    const filteredObject = s3Objects.filter(obj => {
      const keyLower = obj.Key.toLowerCase();
      return supportedExtensions.some(ext => keyLower.endsWith(`.${ext}`));
    });

    for (const s3Object of filteredObject) {
      try {
        // Get chunks for this file
        const chunks = await getS3FileChunks(
          s3Connection,
          bucketName,
          s3Object.Key,
        );

        if (chunks.length === 0) {
          continue;
        }

        const contentHash = createContentHash(chunks);

        // Create knowledge source
        const { knowledgeSourceId } = await api.upsertKnowledgeSource({
          name: s3Object.Key,
          description: `Data from ${s3Object.Key} in S3 bucket ${bucketName}`,
          tags: sourceTags as string[],
          chunkCount: chunks.length,
          contentHashOrTimestamp: contentHash,
          externalIdentifier: s3Object.Key,
        });

        if (knowledgeSourceId) {
          // Add all chunks to the knowledge source
          for (const chunk of chunks) {
            await api.createKnowledgeChunk({
              knowledgeSourceId: knowledgeSourceId,
              text: chunk.text,
              data: chunk.data,
            });
          }
          newsourceIds.push(knowledgeSourceId);
        }
      } catch (error) {
        // Continue with next file even if this one fails
        continue;
      }
    }

            // Remove any previously existing knowledge sources that were not in this run
        if (Array.isArray(sources)) {
            for (const source of sources) {
                const externalId = (source as any).externalIdentifier;
                if (!newsourceIds.includes(externalId)) {
                    try {
                        console.log("Deleting source:", source.knowledgeSourceId);
                        await api.deleteKnowledgeSource({
                            knowledgeSourceId: source.knowledgeSourceId,
                        });
                    } catch (err) {
                        console.error(`Failed to delete source ${source.knowledgeSourceId}:`, err);
                    }
                }
            }
        }
  },
});
