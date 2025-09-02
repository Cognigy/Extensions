import { createKnowledgeDescriptor } from "@cognigy/extension-tools";
import { getTextFromWebPage } from "./parser/webContentParser";
import { simpleSplit } from "./chunker/simpleSplit";

export const webPageContentConnector = createKnowledgeDescriptor({
	type: "webPageContentConnector",
	label: "Web Page Content",
	summary: "This will import content from a web page",
	fields: [
		{
			key: "name",
			label: "Source name prefix",
			type: "text",
			description: "An optional prefix to be appended to Knowledge source's name e.g. 'Wiki Page' or 'My Blog'"
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
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["Web Page"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
	] as const,
	listSources: async ({ config: { name, url, sourceTags }}) => {
		let refinedName = name ? `${name} - ${url}` : url;
		refinedName = refinedName.replace(/https?:\/\//, "").replace(/\//g, "-").replace(/\?.*$/, "");
		return [
			{
				name: refinedName,
				description: `Content from web page at ${url}`,
				tags: sourceTags,
				data: {
					url
				}
			}
		];
	},
	processSource: async ({ source }) => {
		let result = [];
		const url = source.data.url as string;

		// Extract text from webpage
		const text = await getTextFromWebPage(url);

		// Break text into chunks
		let chunks = await simpleSplit(text);

		// Remove any empty chunks
		chunks = chunks.filter(chunk => chunk.trim().length > 0);

		// Maps chunks to this array { text, data }
		result = chunks.map(chunk => ({
			text: chunk as string,
			data: {
				url
			}
		}));

		return result;
	}
});
