// @ts-nocheck

import { createHash } from "node:crypto";
import { createKnowledgeConnector } from "@cognigy/extension-tools";

export const simpleKnowledgeConnector = createKnowledgeConnector({
	type: "simpleKnowledgeConnector",
	label: "Knowledge Connector with alternative update concept",
	summary: "This connector will create a Knowledge Source",
	fields: [
	] as const,
	function: async ({
		config,
		api,
	}) => {
    /*
     This code demonstrates a concept of update existing knowledge sources. A use case is
     updating the Knowledge base on a scheduled basis or when running a Knowledge Connector
     multiple times with the same configuration
     */
    // define some sources
    const exampleSources = [
      "Example Source 1",
      "Example Source 2",
      "Example Source 3",
    ]

    // connector logic
    for (const name of exampleSources) {
      // Define some chunks with random data
      // First chunk will have either 0 or 1 as a random number
      const values = [
        `Chunk with random number: ${Math.floor(Math.random() * 2)}`,
        `Chunk with no random number`,
      ]
      // Calculate example content hash. The update timestamp could also be used
      const exampleContentHashOrTimestamp = createHash('md5')
        .update(values.join(""))
        .digest('hex');

      /*
       Internally createKnowledgeSource will check if the source must be updated or not
       If updated the new source is created with a temporal name. The original source and chunks are kept during the
       whole process. Only when the new source is fully ingested (all chunks created) the original source is deleted
       and the new source is renamed to the original name.
       If someHashOrUpdateTimeStamp=null the content is always updated.
       */
      const { knowledgeSourceId } = await api.createKnowledgeSource({
        name,
        description: "Example knowledge source",
        tags: ["example", option],
        chunkCount: values.length,
        someHashOrUpdateTimeStamp: exampleContentHashOrTimestamp,
      });

      // run content retrieving/chunking logic for each source
      for (const text of values) {
        // In case the content is up to date the `api.createKnowledgeChunk` is a NOOP and does not insert new chunks
        await api.createKnowledgeChunk({
          knowledgeSourceId,
          text,
          data: {
            // Custom data. Can be used during Knowledge extraction
            type: "example",
          },
        });
      }
    }
	},
});
