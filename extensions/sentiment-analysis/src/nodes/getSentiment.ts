import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import processGerman from "../helpers/processGerman";
import processSpanish from "../helpers/processSpanish";

const English = require('../../data/AFINN/AFINN_111.json');
const German = require('../../data/Polartlexicon/polartlexicon.json');
const Spanish = require('../../data/SentiCon/SentiCon.json');

const negationsEN = ["don't", "doesn't", "dont", "doesnt", "not"];
const negationsDE = ["nicht", "kein", "keine", "keiner", "keines", "keinem", "keinen"];
const negationsES = ["no", "sin", "nada", "nunca", "tampoco", "nadie"];

export interface IGetSentimentParams extends INodeFunctionBaseParams {
	config: {
		language: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getSentimentNode = createNodeDescriptor({
	type: "getSentimentNode",
	defaultLabel: "Get Sentiment",
	fields: [
		{
			key: "language",
			label: "Language",
			type: "select",
			defaultValue: "English",
			params: {
				required: true,
				options: [
					{
						label: "English",
						value: "English"
					},
					{
						label: "German",
						value: "German"
					},
					{
						label: "Spanish",
						value: "Spanish"
					}
				],
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "sentiment",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sentiment",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: false,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "language" },
		{ type: "section", key: "storageOption" },
	],
	function: async ({ cognigy, config }: IGetSentimentParams) => {
		const { api, input } = cognigy;
		const { language, storeLocation, inputKey, contextKey } = config;

		const tokens = input?.input?.text.split(" ");
		let dictionary = new Map();
		let negations = new Set();

		switch (language) {
			case 'German':
				dictionary = new Map(Object.entries(German));
				await processGerman(tokens);
				negations = new Set(negationsDE);
				break;
			case 'English':
				dictionary = new Map(Object.entries(English));
				negations = new Set(negationsEN);
				break;
			case 'Spanish':
				dictionary = new Map(Object.entries(Spanish));
				await processSpanish(tokens);
				negations = new Set(negationsES);
				break;
		}

		let score = 0;
		let wordSet = [];

		for (let token in tokens) {
			if (dictionary.has(tokens[token])) {
				let word = tokens[token];
				wordSet.push(word + ': ' + dictionary.get(word));
				score = score + dictionary.get(word);
			}
		}

		const negationList = [];

		for (let token in tokens) {
			if (negations.has(tokens[token])) {
				negationList.push(tokens[token]);
				score = -score;
			}
		}

		const verdict = score === 0 ? "NEUTRAL" : score < 0 ? "NEGATIVE" : "POSITIVE";

		const result = {
			verdict: verdict,
			score: score,
			comparative: score / tokens.length,
			foundWords: wordSet,
			negations: negationList
		};

		if (storeLocation === "context") {
			api.addToContext(contextKey, result, "simple");
		} else {
			// @ts-ignore
			api.addToInput(inputKey, result);
		}
	}
});