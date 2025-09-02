import { createKnowledgeDescriptor } from "@cognigy/extension-tools";

export const chuckNorrisJokesConnector = createKnowledgeDescriptor({
	type: "chuckNorrisJokesConnector",
	label: "Chuck Norris jokes",
	summary: "This will import Chuck Norris jokes",
	fields: [
		{
			key: "name",
			label: "Source name prefix",
			type: "text",
			params: {
				required: true
			},
			description: "A prefix to be appended to Knowledge source's name. e.g. 'Chuck Norris Jokes'"
		},
		{
			key: "categories",
			label: "Categories to fetch",
			type: "textArray",
			params: {
				required: true
			},
			description: "Categories of jokes to fetch. Available categories can be found at https://api.chucknorris.io/jokes/categories"
		},
		{
			key: "amount",
			label: "Number of jokes per source",
			type: "number",
		},
        {
            key: "sourceTags",
            label: "Source Tags",
            type: "chipInput",
            defaultValue: ["chuck norris"],
            description: "Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
        }
	] as const,
	listSources: async ({ config: { name, categories, sourceTags }}) => {
		return categories.map((category) => (
			{
				name: `${name} - ${category}`,
				description: `Chuck Norris jokes about ${category}`,
				tags: sourceTags,
				data: {
					category
				}
			}
		));
	},
	processSource: async ({ config, source }) => {
		const result = [];
		const url = `https://api.chucknorris.io/jokes/random?category=${source.data.category}`;
		for (let i = 0; i < config.amount; i++) {
			try {
				const joke = await (await fetch(url)).json();
				if (joke.value) {
					result.push({
						text: joke.value,
						data: {
							category: source.data.category as string
						}
					});
				}
			} catch (error: any) {
				throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
			}
		}
		return result;
	}
});
