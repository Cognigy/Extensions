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
			label: "Example list of values",
			type: "textArray",
			description: "Each value will be added as a chunk",
			params: {
				required: true,
			},
		},
		{
			key: "option",
			type: "select",
			label: "Example options",
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
		config: { name, values, option, connection, error },
		api,
	}) => {
		// Create an example Knowledge Source and add Knowledge Chunks
		const knowledgeSource = await api.createKnowledgeSource({
			name,
			description: "Example knowledge source",
			tags: ["example", option],
			chunkCount: values.length,
		});
		for (const text of values) {
			await api.createKnowledgeChunk({
				knowledgeSourceId: knowledgeSource.knowledgeSourceId,
				text,
				data: {
					// Custom data. Can be used during Knowledge extraction
					type: "example",
					connectionUsed: (connection as ApiKeyConnection)?.key ? "yes" : "no",
				},
			});
		}

		// example of error handling
		if (error) {
			const knowledgeSource2 = await api.createKnowledgeSource({
				name: "Example Knowledge Source that will be deleted",
				description: "Example error handling during content retrieval",
				tags: ["example"],
				chunkCount: 1,
			});
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
	},
});
