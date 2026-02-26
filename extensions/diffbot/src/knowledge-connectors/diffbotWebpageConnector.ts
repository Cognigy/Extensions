import { createKnowledgeConnector } from "@cognigy/extension-tools";
import { jsonSplit } from "./helper/chunker";
import { calculateContentHash, fetchWithRetry } from "./helper/utils";
import type { DiffbotV3AnalyzeResponse } from "./types";

export const diffbotWebpageConnector = createKnowledgeConnector({
	type: "diffbotWebpageConnector",
	label: "Diffbot Webpage",
	summary:
		"Extract content from a web page or multiple web pages using the Diffbot Extract API to create Knowledge Chunks. A Diffbot subscription is required.",
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
			key: "extractApiType",
			type: "select",
			label: "Extract API Type",
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
		config: { connection, urls, sourceTags, extractApiType },
		api,
		sources: currentSources,
	}) => {
		const { accessToken } = connection as any;
		const updatedSources = new Set<string>();

		for (const url of urls) {
			const params = new URLSearchParams({ token: accessToken, url });
			const diffbotUrl = `https://api.diffbot.com/v3/${extractApiType}?${params}`;
			const analyze =
				await fetchWithRetry<DiffbotV3AnalyzeResponse>(diffbotUrl);
			if (!analyze || !analyze.objects || analyze.objects.length === 0)
				throw new Error(`No data returned from Diffbot for URL: ${url}`);

			// Create chunks
			for (let i = 0; i < analyze.objects.length; i++) {
				const sourceData = analyze.objects[i];
				const externalIdentifier = url;
				const chunkTitle = `title: ${sourceData.title}\ntype: ${sourceData.type}\n`;
				const chunks = await jsonSplit(sourceData, chunkTitle, [
					"html",
					"images",
				]);

				// Upsert Knowledge Source with composite external identifier
				const result = await api.upsertKnowledgeSource({
					name: sourceData.title,
					description: `Content from web page at ${url}`,
					tags: sourceTags,
					chunkCount: chunks.length,
					externalIdentifier,
					contentHashOrTimestamp: calculateContentHash(chunks),
				});
				updatedSources.add(externalIdentifier);

				if (result === null) {
					// Source already up-to-date (content hash unchanged)
					continue;
				}

				// Create Knowledge Chunks for new or updated source
				for (const chunk of chunks) {
					await api.createKnowledgeChunk({
						knowledgeSourceId: result.knowledgeSourceId,
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

		// Clean up superseded sources
		for (const source of currentSources) {
			if (updatedSources.has(source.externalIdentifier)) {
				continue;
			}

			await api.deleteKnowledgeSource({
				knowledgeSourceId: source.knowledgeSourceId,
			});
		}
	},
});
