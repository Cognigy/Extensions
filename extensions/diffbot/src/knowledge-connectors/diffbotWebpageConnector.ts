import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { jsonSplit } from "./helper/chunker";
import { fetchWithRetry } from "./helper/utils";

export const diffbotWebpageConnector = createKnowledgeConnector({
	type: "diffbotWebpageConnector",
	label: "Diffbot Webpage",
	summary: "This will import web page contents using Diffbot's Extract APIs.",
	fields: [
		{
			key: "connection",
			label: "Diffbot Connection",
			type: "connection",
			params: {
				connectionType: "diffbot",
				required: true,
			},
		},
		{
			key: "urls",
			label: "Web page URLs",
			description: "The URLs of the web pages to import content from.",
			type: "textArray",
			params: {
				required: true,
			},
		},
		{
			key: "apiUrlType",
			type: "select",
			label: "API URL Type",
			description:
				"Type of Extract API to call i.e. Product, List, Job etc. If type is not known then choose 'Analyze', however the quality of the result may degrade if 'Analyze' type is chosen.",
			defaultValue: "analyze",
			params: {
				options: [
					{
						label: "Analyze",
						value: "analyze",
					},
					{
						label: "Product",
						value: "product",
					},
					{
						label: "Article",
						value: "article",
					},
					{
						label: "Job",
						value: "job",
					},
					{
						label: "Event",
						value: "event",
					},
					{
						label: "List",
						value: "list",
					},
					{
						label: "Video",
						value: "video",
					},
					{
						label: "Image",
						value: "image",
					},
					{
						label: "Discussion",
						value: "discussion",
					},
					{
						label: "Faq",
						value: "faq",
					},
					{
						label: "Organization",
						value: "organization",
					},
				],
			},
		},
		{
			key: "sourceTags",
			label: "Source Tags",
			description:
				"Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
			defaultValue: ["Web Page"],
			type: "chipInput",
		},
	] as const,
	function: async ({
		config: { connection, urls, sourceTags, apiUrlType },
		api,
	}) => {
		const { accessToken } = connection as any;
		for (const url of urls) {
			const params = new URLSearchParams({ token: accessToken, url });
			const diffbotUrl = `https://api.diffbot.com/v3/${apiUrlType}?${params}`;
			const analyze = await fetchWithRetry(diffbotUrl);
			if (!analyze || !analyze.objects || analyze.objects.length === 0)
				throw new Error(`No data returned from Diffbot for URL: ${url}`);

			// Create chunks
			for (const sourceData of analyze.objects) {
				const chunkTitle = `title: ${sourceData.title}\ntype: ${sourceData.type}\n`;
				const chunks = await jsonSplit(sourceData, chunkTitle, [
					"html",
					"images",
				]);

				// Create Knowledge Source
				const { knowledgeSourceId } = await api.createKnowledgeSource({
					name: sourceData.title,
					description: `Content from web page at ${url}`,
					tags: sourceTags,
					chunkCount: chunks.length,
				});

				// Create Knowledge Chunks
				for (const chunk of chunks) {
					await api.createKnowledgeChunk({
						knowledgeSourceId,
						text: chunk,
						data: {
							url: url,
							title: sourceData.title || "",
							language: sourceData.humanLanguage || "",
							type: sourceData.type || "",
						},
					});
				}
			}
		}
	},
});
