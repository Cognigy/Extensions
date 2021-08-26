import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGenerateAnswerParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			runtimeEndpoint: string;
			resourceKey: string;
			knowledgebaseId: string;
		};
		question: string;
		scoreThreshold: number;
		top: number;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const generateAnswerNode = createNodeDescriptor({
	type: "generateAnswer",
	defaultLabel: "Generate Answer",
	summary: "Searches for answers in QnA Maker knowledgebase",
	fields: [
		{
			key: "connection",
			label: "QnA Maker Connection",
			type: "connection",
			params: {
				connectionType: "qna-maker",
				required: true
			}
		},
		{
			key: "question",
			label: "Question",
			description: "The user question that should be sent to QnA Maker",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "scoreThreshold",
			label: "Score Threshold",
			description: "Threshold for answers returned based on score",
			type: "number",
			defaultValue: 20
		},
		{
			key: "top",
			label: "Number of Results",
			description: "Max number of answers to be returned for the question",
			type: "number",
			defaultValue: 3
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
			type: "text",
			label: "Input Key to store Result",
			defaultValue: "answers",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "answers",
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
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"scoreThreshold",
				"top"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "question" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0078d4"
	},
	dependencies: {
		children: [
			"onFoundAnswer",
			"onNotFoundAnswer"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGenerateAnswerParams) => {
		const { api } = cognigy;
		const { connection, question, top, scoreThreshold, storeLocation, inputKey, contextKey } = config;
		const { resourceKey, knowledgebaseId, runtimeEndpoint } = connection;

		try {
			const response = await axios({
				method: "post",
				url: `${runtimeEndpoint}/knowledgebases/${knowledgebaseId}/generateAnswer`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `EndpointKey ${resourceKey}`
				},
				data: {
					question,
					top,
					scoreThreshold
				}
			});

			if (response.data?.answers[0]?.id === -1) {
				const onNotFoundAnswerChild = childConfigs.find(child => child.type === "onNotFoundAnswer");
				api.setNextNode(onNotFoundAnswerChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, response.data?.answers, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response.data?.answers);
				}
			} else {
				const onFoundAnswersChild = childConfigs.find(child => child.type === "onFoundAnswer");
				api.setNextNode(onFoundAnswersChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, response.data?.answers, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response.data?.answers);
				}
			}

		} catch (error) {

			const onNotFoundAnswerChild = childConfigs.find(child => child.type === "onNotFoundAnswer");
			api.setNextNode(onNotFoundAnswerChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});

export const onFoundAnswer = createNodeDescriptor({
	type: "onFoundAnswer",
	parentType: "generateAnswer",
	defaultLabel: "On Found",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onNotFoundAnswer = createNodeDescriptor({
	type: "onNotFoundAnswer",
	parentType: "generateAnswer",
	defaultLabel: "On Not Found",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});
