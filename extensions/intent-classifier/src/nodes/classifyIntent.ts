import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IClassifyIntentParams extends INodeFunctionBaseParams {
	config: {
		input: string;
		model: string;
		connection: {
			openAiKey: string;
		};
		overwriteIntent: boolean;
		inputSelect: "text" | "conversation";
		intents: string[];
		storeLocation: "input" | "context";
		inputKey: string;
		contextKey: string;
	};
}
export const classifyIntent = createNodeDescriptor({
	type: "classifyIntent",
	defaultLabel: "LLM Intent Classifier",
	fields: [
		{
			key: "model",
			label: "Model",
			type: "cognigyText",
			defaultValue: "gpt-4.1-mini",
			params: {
				required: true
			}
		},
		{
			key: "connection",
			label: "OpenAI Connection",
			type: "connection",
			params: {
				connectionType: "openAiApiKey",
				required: true
			}
		},
		{
			key: "input",
			label: "Input",
			type: "cognigyText",
			params: {
				required: true
			},
			defaultValue: "[[snippet-eyJ0eXBlIjoiaW5wdXQiLCJsYWJlbCI6IlRleHQiLCJzY3JpcHQiOiJpbnB1dC50ZXh0In0=]]"
		},
		{
			key: "intents",
			label: "Intents",
			type: "json",
			params: {
				required: true,
			},
			defaultValue: `[
  {
    "name": "Love You",
    "description": "The user conveys feelings of affection or love towards you but not to something else.",
    "examples": [
      "I love you",
      "You're the best",
      "I adore you"
    ]
  },
  {
    "name": "Complain",
    "description": "The user complains.",
    "examples": [
    ]
  },
  {
    "name": "Fallback",
    "description": "This intent is used when the user's message does not clearly match any known intent or is unrecognizable.",
    "examples": []
  }
]
`
		},
		{
			key: "overwriteIntent",
			label: "Overwrite Intent",
			description: "If set, input.intent and input.intentScore will be overwritten with the found values.",
			type: "toggle",
			defaultValue: true,
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Store Location",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Input",
						value: "input",
					},
					{
						label: "Context",
						value: "context",
					},
				],
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key",
			defaultValue: "classifyIntentResult",
			condition: {
				key: "storeLocation",
				value: "input",
			},
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key",
			defaultValue: "classifyIntentResult",
			condition: {
				key: "storeLocation",
				value: "context",
			},
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage",
			defaultCollapsed: false,
			fields: ["storeLocation", "inputKey", "contextKey"],
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: ["model", "connection"],
		}
	],
	form: [
		{ type: "field", key: "input" },
		{ type: "field", key: "intents" },
		{ type: "field", key: "overwriteIntent" },
		{ type: "section", key: "storage" },
		{ type: "section", key: "advanced" },
	],
	appearance: {
		color: "black"
	},
	function: async ({ cognigy, config }: IClassifyIntentParams) => {
		const { api, input: cognigyInput } = cognigy;
		const { input, connection, model, intents, storeLocation, inputKey, contextKey, overwriteIntent } = config;
		const { openAiKey } = connection;

		try {

			const systemPrompt = `
You are an expert conversation analyst specializing in user intent detection. You have deep knowledge of typical human conversational patterns, indirect speech, emotional expression, and how users naturally communicate their goals, needs, and feelings. Your expertise enables you to accurately interpret even subtle or non-explicit user intents.
You are tasked with classifying a conversation according to predefined intents. The available intents are provided in an XML document. Carefully read the conversation and identify the most appropriate intent based on the provided options.

# Instructions:
- Only consider the last user message in the conversation for intent classification.
- Select an intent only if it clearly matches the meaning and context of a given intent.
- If no suitable intent is found, return an empty result {}.
- Base your decision on the actual meaning and context, not only on keyword matching.
- Pay careful attention to negations (e.g., "I don't love you" must not be classified as "Love You").
- Properly handle references (e.g., ensure that expressions of love or affection are directed at you, not at other entities).
- Provide a confidence score between 0 and 1 (where 1 means maximum certainty).
- Output the result strictly in the following JSON format:
{
  "intent": "<intent_name>",
  "confidence": <confidence_score>
}

# Intents (JSON):
- Each intent is defined by a name (mandatory).
- Each intent may contain a description explaining its purpose and may list examples of typical user expressions.

{
  "intents": ${JSON.stringify(intents)}
}

# Output:
JSON with the classified intent and confidence score.
`;

			const response = await axios({
				method: "post",
				url: `https://api.openai.com/v1/chat/completions`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${openAiKey}`
				},
				data: {
					"model": model,
					"messages": [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: input },
					],
					"response_format": {
						"type": "json_object"
					},
				}
			});

			const classifyResult = response.data.choices[0].message.content;
			const parsedResult = JSON.parse(classifyResult);

			if (storeLocation === "context") {
				api.addToContext?.(contextKey, parsedResult, "simple");
			} else if (storeLocation === "input") {
				api.addToInput(inputKey, parsedResult);
			}

			if (overwriteIntent) {
				cognigyInput.intent = parsedResult.intent || null;
				cognigyInput.intentScore = parsedResult.confidence || null;
			}

		} catch (error) {
			throw new Error(error);
		}
	}
});