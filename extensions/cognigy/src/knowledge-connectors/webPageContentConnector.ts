import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { simpleSplit } from "./chunker/simpleSplit";
import { getTextFromWebPage } from "./parser/webContentParser";

export const webPageContentConnector = createKnowledgeConnector({
	type: "webPageContentConnector",
	label: "Web Page Content",
	summary: "This will import content from a web page",
	fields: [
		{
			key: "name",
			label: "Source name prefix",
			type: "text",
			description:
				"An optional prefix to be appended to Knowledge source's name e.g. 'Wiki Page' or 'My Blog'",
		},
		{
			key: "url",
			label: "Web page URL",
			type: "text",
			params: {
				required: true,
			},
		},
		{
			key: "sourceTags",
			label: "Source Tags",
			type: "chipInput",
			defaultValue: ["Web Page"],
			description:
				"Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
		},
	] as const,
	function: async ({ config: { name, url, sourceTags }, api }) => {
		// Extract text from the web page
		const text = await getTextFromWebPage(url);

		// Break text into chunks
		let chunks = await simpleSplit(text);

		// Remove any empty chunks
		chunks = chunks.filter((chunk) => chunk.trim().length > 0);

		let refinedName = name ? `${name} - ${url}` : url;
		refinedName = refinedName
			.replace(/https?:\/\//, "")
			.replace(/\//g, "-")
			.replace(/\?.*$/, "");

		const { knowledgeSourceId } = await api.createKnowledgeSource({
			name: refinedName,
			description: `Content from web page at ${url}`,
			tags: sourceTags,
			chunkCount: chunks.length,
		});

		for (const chunk of chunks) {
			await api.createKnowledgeChunk({
				knowledgeSourceId,
				text: chunk,
				data: {
					url,
				},
			});
		}
	},
});
