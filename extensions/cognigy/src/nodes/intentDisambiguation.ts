import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createQuickReplies } from "../helpers/createQuickReplies";

export interface intentDisambiguationParams extends INodeFunctionBaseParams {
	config: {
		maxScoreDelta: number,
		disambiguationQuestion: string;
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
			description: "The maximum difference between to intent scores.",
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
		{ type: "section", key: "storage" },
	],
	function: async ({ cognigy, config }: intentDisambiguationParams) => {
		const { input, api } = cognigy;
		const { maxScoreDelta, disambiguationQuestion, storeLocation, contextKey, inputKey } = config;

		try {
			let similarIntents = [];
			let i = 1;
			// Loop through each intent that was mapped
			for (i = 1; i < input.nlu.intentMapperResults.scores.length; i++) {
				// Find the score difference between the main intent and the mapped intent
				let delta = (input.nlu.intentMapperResults.finalIntentScore - input.nlu.intentMapperResults.scores[i].score);
				// If the delta is less than the limit, add it to the array for similar intnets
				if (delta < maxScoreDelta) {
					input.nlu.intentMapperResults.scores[i].delta = delta;
					similarIntents.push(input.nlu.intentMapperResults.scores[i]);
				}
			}

			// Sort the similar intents by delta value in decending order
			let array = similarIntents.sort((a, b) => {
				return a.delta - b.delta;
			});

			let output = {
				count: array.length,
				intents: array
			};

			if (output.count > 0) {
				api.say('', {
					"_cognigy": {
						"_fallbackText": disambiguationQuestion,
						"_default": {
							"message": {
								"quick_replies": createQuickReplies(input, array),
								"text": disambiguationQuestion
							}
						}
					}
				});
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