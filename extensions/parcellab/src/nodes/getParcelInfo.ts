import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetParcelInfoParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			user: any;
		};
		orderNumber: string;
		language: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getParcelInfo = createNodeDescriptor({
	type: "getParcelInfo",
	defaultLabel: "Get Parcel Info",
	fields: [
		{
			key: "connection",
			label: "Parcel Lab Connection",
			type: "connection",
			params: {
				connectionType: "parcellab",
			}
		},
		{
			key: "orderNumber",
			label: "Parcel Order Number",
			type: "cognigyText",
		},
		{
			key: "language",
			label: "Language",
			type: "select",
			defaultValue: "en",
			params: {
				options: [{ label: "German", value: "de" }, { label: "English", value: "en" }]
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
			defaultValue: "parcel",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "parcel",
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "orderNumber" },
		{ type: "field", key: "language" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#000f66"
	},

	function: async ({ cognigy, config }: IGetParcelInfoParams) => {
		const { api } = cognigy;
		const { connection, orderNumber, language, storeLocation, inputKey, contextKey } = config;
		const { user } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.parcellab.com/v2/checkpoints/?user=${user}&orderNo=${orderNumber}&lang=${language}`,
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}

	}
});