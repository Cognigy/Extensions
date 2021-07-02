import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nodeColor } from '../utils/design';

export interface IHangupParams extends INodeFunctionBaseParams {
	config: {
		hangupReason: string;
	};
}
export const hangupNode = createNodeDescriptor({
	type: "hangup",
	defaultLabel: "Hang Up",
	summary: "Hangs up the call",
	fields: [
		{
			key: "hangupReason",
			label: "Reason",
			type: "cognigyText",
			defaultValue: "Bot ended the call",
			params: {
				required: true
			}
		},
	],
	preview: {
		key: "hangupReason",
		type: "text"
	},
	appearance: {
		color: nodeColor
	},
	form: [
		{ type: "field", key: "hangupReason" }
	],
	function: async ({ cognigy, config }: IHangupParams) => {
		const { api } = cognigy;
		const { hangupReason } = config;

		if (!hangupReason) throw new Error('The hangup reason is missing.');

		api.output(null, {
			"_cognigy": {
				"_voiceGateway": {
					"json": {
						"activities": [
							{
								"type": "event",
								"name": "hangup",
								"activityParams": {
									hangupReason
								}
							}
						]
					}
				}
			}
		});
	}
});