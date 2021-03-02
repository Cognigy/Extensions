import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const NewsAPI = require('newsapi');

export interface IGetNewsHeadlines extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		query: string;
		country: string;
		language: string;
		site: string;
		category: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getNewsHeadlines = createNodeDescriptor({
	type: "getNewsHeadlines",
	defaultLabel: "Get News Headlines",
	preview: {
		key: "query",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "api-key",
				required: true
			}
		},
		{
			key: "query",
			label: "Search Term",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "country",
			label: "News Country",
			type: "select",
			defaultValue: "us",
			params: {
				required: true,
				options: [
					{ label: "ae", value: "ae" }, { label: "ar", value: "ar" }, { label: "at", value: "at" }, { label: "au", value: "au" }, { label: "be", value: "be" }, { label: "bg", value: "bg" }, { label: "br", value: "br" }, { label: "ca", value: "ca" }, { label: "ch", value: "ch" }, { label: "cn", value: "cn" }, { label: "co", value: "co" }, { label: "cu", value: "cu" }, { label: "cz", value: "cz" }, { label: "de", value: "de" }, { label: "eg", value: "eg" }, { label: "fr", value: "fr" }, { label: "gb", value: "gb" }, { label: "gr", value: "gr" }, { label: "hk", value: "hk" }, { label: "hu", value: "hu" }, { label: "id", value: "id" }, { label: "ie", value: "ie" }, { label: "il", value: "il" }, { label: "in", value: "in" }, { label: "it", value: "it" }, { label: "jp", value: "jp" }, { label: "kr", value: "kr" }, { label: "lt", value: "lt" }, { label: "lv", value: "lv" }, { label: "ma", value: "ma" }, { label: "mx", value: "mx" }, { label: "my", value: "my" }, { label: "ng", value: "ng" }, { label: "nl", value: "nl" }, { label: "no", value: "no" }, { label: "nz", value: "nz" }, { label: "ph", value: "ph" }, { label: "pl", value: "pl" }, { label: "pt", value: "pt" }, { label: "ro", value: "ro" }, { label: "rs", value: "rs" }, { label: "ru", value: "ru" }, { label: "sa", value: "sa" }, { label: "se", value: "se" }, { label: "sg", value: "sg" }, { label: "si", value: "si" }, { label: "sk", value: "sk" }, { label: "th", value: "th" }, { label: "tr", value: "tr" }, { label: "tw", value: "tw" }, { label: "ua", value: "ua" }, { label: "us", value: "us" }, { label: "ve", value: "ve" }, { label: "za", value: "za" }
				]
			}
		},
		{
			key: "language",
			type: "select",
			label: "News Language",
			defaultValue: "en",
			params: {
				required: true,
				options: [
					{
						label: "English",
						value: "en",
					},
					{
						label: "German",
						value: "de",
					},
				],
			},
		},
		{
			key: "site",
			label: "Newspaper",
			type: "select",
			params: {
				required: true,
				options: [{ label: "BBC News", value: "bbc-news" }, { label: "The Verge", value: "the-verge" }, { label: "CBS News", value: "cbs-news" }, { label: "ABC News", value: "abc-news" }, { label: "Bild", value: "bild" }, { label: "CNN", value: "cnn" }, { label: "Der Tagesspiegel", value: "der-tagesspiegel" }, { label: "Focus", value: "focus" }, { label: "FOX News", value: "fox-news" }, { label: "t3n", value: "t3n" }, { label: "Marca", value: "marca" }, { label: "The Telegraph", value: "the-telegraph" }, { label: "Wired", value: "wired" }, { label: "The Wall Street Journal", value: "the-wall-street-journal" }, { label: "Spiegel Online", value: "spiegel-online" }, { label: "The Washington Times", value: "the-washington-times" }, { label: "The New York Times", value: "the-new-york-times" }, { label: "Die Zeit", value: "die-zeit" }, { label: "La Repubblica", value: "la-repubblica" }, { label: "NHL News", value: "nhl-news" }, { label: "ESPN", value: "espn" }],
			}
		},
		{
			key: "category",
			label: "Category",
			type: "select",
			defaultValue: "general",
			params: {
				required: true,
				options: [{ label: "General", value: "general" }, { label: "Business", value: "business" }, { label: "Technology", value: "technology" }, { label: "Entertainment", value: "entertainment" }, { label: "Health", value: "health" }, { label: "Science", value: "science" }, { label: "Sports", value: "sports" }],
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "news",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "news",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		},
		{
			key: "newsOptions",
			label: "News Options",
			defaultCollapsed: false,
			fields: [
				"category",
				"site",
				"language",
				"country"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "query" },
		{ type: "section", key: "newsOptions" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#000000"
	},
	function: async ({ cognigy, config }: IGetNewsHeadlines) => {
		const { api } = cognigy;
		const { query, country, site, category, language, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const newsapi = new NewsAPI(key);

			const response = await newsapi.v2.topHeadlines({
				site,
				q: query,
				category,
				language,
				country
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});