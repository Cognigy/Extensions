import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IHangupParams extends INodeFunctionBaseParams {
	config: {
		hangupReason: string;
	};
}
export const hangupNode = createNodeDescriptor({
	type: "hangup",
	defaultLabel: "Hang Up",
	fields: [
		{
			key: "hangupReason",
			label: "Reason",
			type: "cognigyText",
			params: {
				required: true
			}
		},
	],
	form: [
		{ type: "field", key: "hangupReason" }
	],
	function: async ({ cognigy, config }: IHangupParams) => {
		const { api } = cognigy;
		const { hangupReason } = config;

		if (!hangupReason) throw new Error('The hangup reason is missing.');

		api.output('', {
			"_cognigy": {
				"_audiocodes": {
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
		});
	}
});