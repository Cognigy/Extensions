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

        // Create knowledge source
        const { knowledgeSourceId } = await api.createKnowledgeSource({
          name: s3Object.Key,
          description: `Data from ${s3Object.Key} in S3 bucket ${bucketName}`,
          tags: sourceTags as string[],
          chunkCount: chunks.length,
        });


        // Add all chunks to the knowledge source
        let chunkIndex = 0;
        for (const chunk of chunks) {
          await api.createKnowledgeChunk({
            knowledgeSourceId: knowledgeSourceId,
            text: chunk.text,
            data: chunk.data,
          });
          chunkIndex++;
          // Log progress every 100 chunks
          if (chunkIndex % 100 === 0) {
          }
        }


      } catch (error) {
        // Continue with next file even if this one fails
        continue;
      }
    }

  },
});