// @ts-nocheck

import { createHash } from "node:crypto";
import { createKnowledgeConnector } from "@cognigy/extension-tools";

export const simpleKnowledgeConnector = createKnowledgeConnector({
	type: "simpleKnowledgeConnector",
	label: "Knowledge Connector with update concept",
	summary: "This connector will create a Knowledge Source",
	fields: [
    {
      key: "update",
      label: "If existing sources should be updated. If disabled a new source will be created.",
      type: "text",
      defaultValue: "Example",
      params: {
        required: true,
      },
    },
	] as const,
	function: async ({
    // "update" flag must be defined as a field in the extension to be available via config.
    // Alternatively, we can define an explicit variable, f.e. { config, api, updateExistingSources }
		config: { update },
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
      let knowledgeSourceId: string;
      let existingKnowledgeSource: KnowledgeSource | null;
      let createChunks = !update;

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

      if (update) {
        // find the source with the same name
        existingKnowledgeSource = await api.findKnowledgeSourceByName({
          name
        });

        if (existingKnowledgeSource) {
          // set knowledgeSourceId to the existing source
          knowledgeSourceId = existingKnowledgeSource.knowledgeSourceId;

          // someHashOrUpdateTimeStamp is a new field for explicit usage, can also be part of metadata
          if (existingKnowledgeSource.someHashOrUpdateTimeStamp !== exampleContentHashOrTimestamp) {
            // delete chunks of the existing source
            await api.deleteKnowledgeChunks({
              knowledgeSourceId,
            })

            // we must insert chunks if the existing source is outdated
            createChunks = true;
          }
        } else {
          // create a new source
          const knowledgeSource = await api.createKnowledgeSource({
            name,
            description: "Example knowledge source",
            tags: ["example", option],
            chunkCount: values.length,
            someHashOrUpdateTimeStamp: exampleContentHashOrTimestamp,
          });
          knowledgeSourceId = knowledgeSource.knowledgeSourceId;

          // we must create chunks if no source exists
          createChunks = true;
        }
      } else {
        // create a new source
        const knowledgeSource = await api.createKnowledgeSource({
          name,
          description: "Example knowledge source",
          tags: ["example", option],
          chunkCount: values.length,
          someHashOrUpdateTimeStamp: exampleContentHashOrTimestamp,
        });
        knowledgeSourceId = knowledgeSource.knowledgeSourceId;
      }

      /*
       Only run chunk creation logic if
       */
      if (createChunks) {
        // run content retrieving/chunking logic for each source
        for (const text of values) {
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
    }
	},
});
