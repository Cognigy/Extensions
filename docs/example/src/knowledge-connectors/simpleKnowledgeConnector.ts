import * as crypto from "node:crypto";
import { createKnowledgeConnector } from "@cognigy/extension-tools";
import type { ApiKeyConnection } from "../connections/apiKeyConnection";

export const simpleKnowledgeConnector = createKnowledgeConnector({
	type: "simpleKnowledgeConnector",
	label: "Simple Knowledge Connector",
	summary: "This connector will create a Knowledge Source",
	fields: [
		{
			key: "connection",
			label: "Connections can be used",
			type: "connection",
			params: {
				connectionType: "api-key",
				required: false,
			},
		},
		{
			key: "name",
			label: "Name of the created knowledge source",
			type: "text",
			defaultValue: "Example",
			params: {
				required: true,
			},
		},
		{
			key: "values",
			label: "Example list of chunk values",
			type: "textArray",
			description: "Each value will be added as a chunk",
			params: {
				required: true,
			},
		},
		{
			key: "tags",
			type: "select",
			label: "Example tags",
			defaultValue: "option1",
			description: "The selected option will be added as a tag",
			params: {
				options: [
					{
						label: "Option 1",
						value: "option1",
					},
					{
						label: "Option 2",
						value: "option2",
					},
				],
			},
		},
		{
			key: "error",
			label: "Example error",
			type: "text",
			description:
				"Can be used to demonstrate how errors within Knowledge Connectors are handled",
			params: {
				required: false,
			},
		},
	] as const,
	function: async ({
		config: { connection, name, tags, values, error },
		api,
		sources,
	}) => {
		const content = values
			.map((text) => ({ text }))
			.map((c) => c.text)
			.join("");
		const contentHash = crypto.hash("sha256", content, "hex");
		const newSources = [];
		const knowledgeSource = await api.upsertKnowledgeSource({
			name,
			description: "Example knowledge source",
			tags: [tags],
			chunkCount: values.length, // This is the total chunk count Knowledge Source expected to have
			contentHashOrTimestamp: contentHash, // Used to identify if the content has changed during an upsert operation
		});
		newSources.push(name);

		if (knowledgeSource) {
			for (const text of values) {
				await api.createKnowledgeChunk({
					knowledgeSourceId: knowledgeSource.knowledgeSourceId,
					text,
					data: {
						type: "example",
						connectionUsed: (connection as ApiKeyConnection)?.key
							? "yes"
							: "no",
					},
				});
			}
		}

		// example of error handling
		if (error) {
			const knowledgeSource2 = await api.upsertKnowledgeSource({
				name: "Example Knowledge Source that will be deleted",
				description: "Example error handling during content retrieval",
				tags: [tags],
				chunkCount: 1,
				contentHashOrTimestamp: Date.now().toString(),
			});
			if (knowledgeSource2) {
				try {
					// Example of an error during content retrieval
					throw new Error(error);
				} catch (e) {
					// The newly created Knowledge Source is deleted
					await api.deleteKnowledgeSource({
						knowledgeSourceId: knowledgeSource2.knowledgeSourceId,
					});
					// An unhandled exception thrown during extension execution will be logged
					throw e;
				}
			}
		}

		// Iterate existing sources and delete the ones that no longer
		// exists in external knowledge base. externalIdentifier defaults to
		// source name if not explictly set in upsertKnowledgeSource
		for (const source of sources) {
			if (!newSources.includes(source.externalIdentifier)) {
				await api.deleteKnowledgeSource({
					knowledgeSourceId: source.knowledgeSourceId,
				});
			}
		}
	},
});
