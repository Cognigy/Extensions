import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendMetaDataParams extends INodeFunctionBaseParams {
	config: {
		metaData: string;
	};
}
export const sendMetaDataNode = createNodeDescriptor({
	type: "sendMetaData",
	defaultLabel: "Send MEta Data",
	fields: [
		{
			key: "metaData",
			label: "Meta Data",
			type: "json",
			defaultValue: { myParamName: "myParamValue" },
			params: {
				required: true
			},
			description: "Sends meta data via SIP INFO messages"
		},
	],
	appearance: {
		color: "#F5A623"
	},
	form: [
		{ type: "field", key: "metaData" }
	],
	function: async ({ cognigy, config }: ISendMetaDataParams) => {
		const { api } = cognigy;
		const { metaData } = config;

		api.output('', {
			"_cognigy": {
				"_audioCodes": {
					"json": {
						"activities": [
							{
								"type": "event",
								"name": "sendMetaData",
								"value": metaData
							  }
						]
					}
				}
			}
		});
	}
});