import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IRunBingSpellCheck extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		}
		threshold: number;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const bingSpellCheck = createNodeDescriptor({
	type: "bingSpellCheck",
	defaultLabel: "Bing Spell Check",
	preview: {
		key: "cognigytext",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			type: "connection",
			label: "Bing Connection",
			params: {
				connectionType: "bing"
			}
		},
		{
			key: "threshold",
			type: "slider",
			label: "Threshold",
			defaultValue: 0.5,
			params: {
				min: 0,
				max: 1,
				step: 0.1
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
			defaultValue: "proofreadInput",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "proofreadInput",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storage",
			label: "Storage Options",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "threshold" },
		{ type: "section", key: "storage" },
	],	
	function: async ({ cognigy, config }: IRunBingSpellCheck) => {
		const { input, api } = cognigy;
		const { connection, threshold, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.bing.microsoft.com/v7.0/spellcheck?mode=proof&mkt=${input.language}&text=q=${encodeURIComponent(input.text)}`,
				headers: {
					'Ocp-Apim-Subscription-Key': key,
					'Accept': 'application/json'
				}
			});

			let spellCheckResult = response.data;
			let proofreadInput = input.text;

			// Sort flaggedTokens by offset in descending order to avoid messing up the offsets
			// while replacing text from the beginning to the end.
			// spellCheckResult.flaggedTokens.sort((a, b) => b.offset - a.offset);

			spellCheckResult.flaggedTokens.forEach(flaggedToken => {
				const { offset, token, suggestions } = flaggedToken;
				// Replace only if score is above threshold and if it's longer than "A" (because Bing seems to have a bug with single-character fixes)
				if (suggestions[0].score > threshold && (suggestions[0].suggestion.length > 1 || suggestions[0].suggestion === "A")) {
					const suggestion = suggestions[0].suggestion;
					const startIndex = proofreadInput.indexOf(token, offset - token.length + 1);
					if (startIndex !== -1) { // Only replace if the misspelled word was found
						const endIndex = startIndex + token.length;
						proofreadInput = proofreadInput.substring(0, startIndex) + suggestion + proofreadInput.substring(endIndex);
					}
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, proofreadInput, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, proofreadInput);
			}

			// @ts-ignore
			// api.addToInput("spellCheckResult", response.data);
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
