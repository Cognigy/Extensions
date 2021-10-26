import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
import { handleAdaptiveCard } from "../handlers/handleAdaptiveCard";

export interface IGetDirectionsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		origin: string;
		destination: string;
		showAdaptiveCard: boolean;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getDirectionsNode = createNodeDescriptor({
	type: "getDirections",
	defaultLabel: "Get Directions",
	summary: "Returns instructions for a requested direction",
	preview: {
		key: "destination",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "db",
				required: true
			}
		},
		{
			key: "origin",
			label: "Origin",
			type: "cognigyText",
			description: "The transit station such as Berlin Hbf",
			params: {
				required: true
			}
		},
		{
			key: "destination",
			label: "Destination",
			type: "cognigyText",
			description: "The transit station such as Berlin Hbf",
			params: {
				required: true
			}
		},
		{
			key: "showAdaptiveCard",
			label: "Show Adaptive Card",
			type: "toggle",
			description: "Whether to display an adaptive card with the directions or not",
			defaultValue: false
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
			defaultValue: "db",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "db",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "displayOptions",
			label: "Display Options",
			defaultCollapsed: true,
			fields: [
				"showAdaptiveCard",
			]
		},
		{
			key: "storageOption",
			label: "Storage Option",
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
		{ type: "field", key: "origin" },
		{ type: "field", key: "destination" },
		{ type: "section", key: "displayOptions" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "red"
	},
	function: async ({ cognigy, config }: IGetDirectionsParams) => {
		const { api } = cognigy;
		let { connection, origin, destination, showAdaptiveCard, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {

			const response = await axios({
				method: 'get',
				url: `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=transit&key=${key}`
			});

			if (showAdaptiveCard === true) {

				const transitSteps = await handleAdaptiveCard(response.data);

				const outputData = {
					"_plugin": {
						"type": "adaptivecards",
						"payload": {
							"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
							"type": "AdaptiveCard",
							"version": "1.0",
							"body": transitSteps
						}
					}
				};

				api.say("", outputData);
			} else {
				if (storeLocation === "context") {
					api.addToContext(contextKey, response.data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response.data);
				}
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