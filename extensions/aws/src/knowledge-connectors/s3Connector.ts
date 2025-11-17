import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { getS3Object } from "./helpers/list_files";
import { getS3FileChunks, S3Connection } from "./helpers/new_utils";

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

  function: async ({ config, api }) => {
    const { connection, bucketName, sourceTags } = config;

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

    // Get all S3 objects in the bucket
    const s3Objects = await getS3Object(s3Connection, bucketName);

    console.log(`Found ${s3Objects.length} files in S3 bucket: ${bucketName}`);

    // Process each S3 object
    for (const s3Object of s3Objects) {
      console.log(`Processing file: ${s3Object.Key}`);

      try {
        // Get chunks for this file
        const chunks = await getS3FileChunks(
          s3Connection,
          bucketName,
          s3Object.Key,
        );

        if (chunks.length === 0) {
          console.log(`No chunks generated for ${s3Object.Key}, skipping...`);
          continue;
        }

        // Create knowledge source
        const { knowledgeSourceId } = await api.createKnowledgeSource({
          name: s3Object.Key,
          description: `Data from ${s3Object.Key} in S3 bucket ${bucketName}`,
          tags: sourceTags as string[],
          chunkCount: chunks.length,
        });

        console.log(`Created knowledge source for ${s3Object.Key} with ID: ${knowledgeSourceId}`);

        // Add all chunks to the knowledge source
        for (const chunk of chunks) {
          await api.createKnowledgeChunk({
            knowledgeSourceId,
            text: chunk.text,
            data: chunk.data,
          });
        }

        console.log(`Added ${chunks.length} chunks to ${s3Object.Key}`);

      } catch (error) {
        console.error(`Error processing ${s3Object.Key}:`, error);
        // Continue with next file even if this one fails
        continue;
      }
    }

    console.log(`✅ Completed processing ${s3Objects.length} files from S3 bucket`);
  },
});