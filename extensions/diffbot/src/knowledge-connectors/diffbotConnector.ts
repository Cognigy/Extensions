import { createKnowledgeDescriptor } from "@cognigy/extension-tools";
import { simpleSplit } from "./chunker/jsonSplitter";

export const diffbotConnector = createKnowledgeDescriptor({
	type: "diffbotConnector",
	label: "Diffbot",
	summary: "This will import web page contents using Diffbot's Crawl API.",
	fields: [
		{
			key: "connection",
			label: "Diffbot Connection",
			type: "connection",
			params: {
				connectionType: "diffbot",
				required: true
			}
		},
		{
			key: "url",
			label: "Web page URL",
			type: "text",
			params: {
				required: true
			}
		},
		{
			key: 'extractType',
			type: 'select',
			label: 'Web page Type',
			defaultValue: 'input',
			description: 'Type of content the web page have i.e. Product, List, Job etc. If type is not known then choose \'Other\' type, however the accuracy of the result may be affected if \'Other\' type is chosen.',
			params: {
				options: [
					{
						label: 'Product',
						value: 'product'
					},
					{
						label: 'Article',
						value: 'article'
					},
					{
						label: 'Job',
						value: 'job'
					},
					{
						label: 'Event',
						value: 'event'
					},
					{
						label: 'List',
						value: 'list'
					},
					{
						label: 'Other',
						value: 'analyze'
					}
				],
				required: true
			}
		},
        {
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["Web Page"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
	] as const,
	listSources: async ({config: { url, sourceTags, extractType }}) => {
		let refinedName = extractType ? `${extractType} - ${url}` : url;
		refinedName = refinedName.replace(/https?:\/\//, "").replace(/\//g, "-").replace(/\?.*$/, "");
		return [
			{
				name: refinedName,
				description: `Content from web page at ${url}`,
				tags: sourceTags,
				data: {
					url,
					extractType
				}
			}
		];
	},
	processSource: async ({ config, source }) => {
		let result = [];
		const { accessToken } = config.connection as any;
		const { url, extractType } = source.data as any;
		try {
			const analyze = await fetchData(url, accessToken, extractType);
			if (!analyze || !analyze.objects || analyze.objects.length === 0)
				throw new Error(`No data returned from Diffbot for URL: ${url}`);

			// Remove unnecessary fields to reduce chunks
			delete analyze.objects[0].html;

			// Create chunks
			const chunks = await simpleSplit(analyze);

			// Maps chunks to this array { text, data }
			const object = analyze.objects[0];
			result = chunks.map((chunk: string, index: number) => ({
				text: chunk,
				data: {
					url,
                    title: object.title as string || "",
					language: object.humanLanguage as string || "",
					type: object.type as string || "",
					chunkIndex: index
				}
			}));

		} catch (error: any) {
			throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
		}
		return result;

	}
});

/**
 * Fetches data from a given URL with the specified token.
 */
const fetchData = async (url: string, token: string, type: string) => {
    try {
		const diffbotUrl = `https://api.diffbot.com/v3/${type}?token=${token}&url=${encodeURIComponent(url)}`;
        const response = await fetch(diffbotUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok)
			throw new Error(`Diffbot API error: ${response.status}`);
		return await response.json();
    } catch (error: any) {
        throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
    }
};

