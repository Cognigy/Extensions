import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createQuickReplies } from "../helpers/createQuickReplies";
import { createList, createPlainText } from "../helpers/createList";
import { IIntent } from "../helpers/types";

export interface IntentDisambiguationParams extends INodeFunctionBaseParams {
	config: {
		maxScoreDelta: number,
		disambiguationQuestion: string;
		replyType: string;
		punctuation: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const intentDisambiguationNode = createNodeDescriptor({
	type: "intentDisambiguation",
	defaultLabel: "Intent Disambiguation",
	fields: [
		{
			key: "maxScoreDelta",
			label: "Maximum Score Delta",
			description: "The maximum difference between two intent scores.",
			type: "number",
			params: {
				required: true
			}
		},
		{
			key: "disambiguationQuestion",
			label: "Disambiguation Question",
			description: "The question that is sent to the user to disambiguate the intents.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "replyType",
			label: "Reply Type",
            description: "What type of reply should be used?",
			type: "select",
			params: {
				options: [
					{
						label: "Quick Replies",
						value: "quickReplies"
					},
					{
						label: "List",
						value: "list"
					},
					{
						label: "Plain Text",
						value: "plainText"
					},
					{
						label: "Data Only",
						value: "dataOnly"
					},
				]
			},
			defaultValue: "quickReplies"
		},
		{
			key: "punctuation",
			label: "Punctuation",
            description: "How to end the sentence",
			type: "select",
			params: {
				options: [
					{
						label: ".",
						value: "."
					},
					{
						label: "?",
						value: "?"
					},
					{
						label: "!",
						value: "!"
					}
				]
			},
			condition: {
				key: "replyType",
				value: "plainText"
			},
			defaultValue: "?"
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
			defaultValue: "cognigy.disambiguation",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "cognigy.disambiguation",
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
	],
	form: [
		{ type: "field", key: "maxScoreDelta" },
		{ type: "field", key: "disambiguationQuestion"},
		{ type: "field", key: "replyType"},
		{ type: "field", key: "punctuation"},
		{ type: "field", key: "butStatement"},
		{ type: "section", key: "storage" },
	],
	tokens: [
		{
			label: "First Intent",
			script: "input.nlu.intentMapperResults.finalIntentDisambiguationSentence",
			type: "input"
		}
	],
	function: async ({ cognigy, config }: IntentDisambiguationParams) => {
		const { input, api } = cognigy;
		const { maxScoreDelta, disambiguationQuestion, replyType, punctuation, storeLocation, contextKey, inputKey} = config;

		try {
			const similarIntents: IIntent[] = [];
			let i = 1;

			// Loop through each intent that was mapped
			for (i = 1; i < input.nlu.intentMapperResults.scores.length; i++) {

				// Find the score difference between the main intent and the mapped intent
				const delta = (input.nlu.intentMapperResults.finalIntentScore - input.nlu.intentMapperResults.scores[i].score);

				// If the delta is less than the limit, add it to the array for similar intents
				if (delta < maxScoreDelta) {
					const intent: IIntent = {
						...input.nlu.intentMapperResults.scores[i],
						delta
					};
					similarIntents.push(intent);
				}
			}

			// Sort the similar intents by delta value in decending order
			const array = similarIntents.sort((a, b) => {
				return a.delta - b.delta;
			});

			const output = {
				count: array.length,
				intents: array
			};

			if (output.count > 0) {
				switch (replyType) {
					case "quickReplies":
						api.say('', {
							"_cognigy": {
								"_fallbackText": disambiguationQuestion,
								"_default": {
									"_quickReplies": {
										"type": "quick_replies",
										"quickReplies": createQuickReplies(input, array),
										"text": disambiguationQuestion
									}
								}
							}
						});
						break;
					case "list":
						api.say(disambiguationQuestion, {});
						api.say('', {
							"_cognigy": {
    							"_default": {
      								"_list": {
        								"type": "list",
        								"items": createList(input, array),
        								"button": { "title": "", "type": "", "payload": "", "condition": "" }
      								}
    							}
  							}
						});
						break;
					case "plainText":
						api.say(disambiguationQuestion + createPlainText(input, array) + punctuation, {});
				}
				}
	if (storeLocation === "context") {
		api.addToContext(contextKey, output, "simple");
		} else {
					// @ts-ignore
			api.addToInput(inputKey, output);
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