import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nodeColor } from '../utils/design';

export interface ISendMetaDataParams extends INodeFunctionBaseParams {
	config: {
		metaData: string;
	};
}
export const sendMetaDataNode = createNodeDescriptor({
	type: "sendMetaData",
	defaultLabel: "Send Meta Data",
	summary: "Sends meta data via SIP INFO messages",
	fields: [
		{
			key: "metaData",
			label: "Meta Data",
			type: "json",
			defaultValue: { myParamName: "myParamValue" },
			params: {
				required: true
			},
			description: "The meta data to send via SIP INFO messages"
		},
	],
	appearance: {
		color: nodeColor
	},
	form: [
		{ type: "field", key: "metaData" }
	],
	function: async ({ cognigy, config }: ISendMetaDataParams) => {
		const { api } = cognigy;
		const { metaData } = config;

		api.output(null, {
			"_cognigy": {
				"_voiceGateway": {
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