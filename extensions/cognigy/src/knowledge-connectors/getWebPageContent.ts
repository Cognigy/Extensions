import { createKnowledgeDescriptor } from "@cognigy/extension-tools";
import { getTextFromWebPage } from "./parser/webContentParser";
import { simpleSplit } from "./chunker/simpleSplit";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5;
const STABILITY_THRESHOLD = 6;

export const webPageConnector = createKnowledgeDescriptor({
	type: "webPage",
	label: "Get web page content",
	summary: "This will import content from a web page",
	fields: [
		{
			key: "url",
			label: "Web page URL",
			type: "text",
			params: {
				required: true
			}
		},
        {
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["chuck norris"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
	] as const,
	listSources: async ({config: { url, sourceTags }}) => {
		return [
			{
				name: `Web page - ${url}`,
				description: `Content from web page at ${url}`,
				tags: sourceTags,
				data: {
					url
				}
			}
		];
	},
	processSource: async ({ config, source }) => {
		let result = [];
		const url = source.data.url as string;
		try {

			// Extract text from webpage using playwright
			const text = await getTextFromWebPage(url, {
				maxRetries: MAX_RETRIES,
				retryInterval: RETRY_INTERVAL,
				stabilityThreshold: STABILITY_THRESHOLD
			});

			// Break text into chunks using the "simplesplit128" approach
			let chunks = await simpleSplit(text);

			// Remove any empty chunks
			chunks = chunks.filter(chunk => chunk.trim().length > 0);

			// chunks to this array { text, data }
			result = chunks.map(chunk => ({
				text: chunk as string,
				data: {}
			}));
		} catch (error: any) {
			throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
		}
		return result;
	}
});