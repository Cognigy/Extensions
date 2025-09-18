import { createKnowledgeConnector } from "@cognigy/extension-tools";

export const chuckNorrisJokesConnector = createKnowledgeConnector({
	type: "chuckNorrisJokesConnector",
	label: "Chuck Norris jokes",
	summary: "This will import Chuck Norris jokes",
	fields: [
		{
			key: "name",
			label: "Source name prefix",
			type: "text",
			params: {
				required: true,
			},
			description:
				"A prefix to be appended to Knowledge source's name. e.g. 'Chuck Norris Jokes'",
		},
		{
			key: "categories",
			label: "Categories to fetch",
			type: "textArray",
			params: {
				required: true,
			},
			description:
				"Categories of jokes to fetch. Available categories are animal, career, celebrity, dev, explicit, fashion, food, history, money, movie, music, political, religion, science, sport, travel",
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
			description:
				"Source tags can be used to filter the search scope from the Flow. Press ENTER to add a Source Tag.",
		},
	] as const,
	function: async ({
		config: { name, categories, sourceTags, amount },
		api,
	}) => {
		for (const category of categories) {
			const { knowledgeSourceId } = await api.createKnowledgeSource({
				name: `${name} - ${category}`,
				description: `Chuck Norris jokes about ${category}`,
				tags: sourceTags,
				chunkCount: amount,
			});

			for (let i = 0; i < amount; i++) {
				const url = `https://api.chucknorris.io/jokes/random?category=${category}`;
				const joke = await (await fetch(url)).json();

				await api.createKnowledgeChunk({
					knowledgeSourceId,
					text: joke.value,
					data: {
						category,
					},
				});
			}
		}
	},
});
