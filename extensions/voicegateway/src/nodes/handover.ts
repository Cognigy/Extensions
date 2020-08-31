import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		transferTarget: string;
		handoverReason: string;
	}
}

export const handoverNode = createNodeDescriptor({
	type: "handover",
	defaultLabel: "Handover",
	fields: [
		{
			key: "transferTarget",
			label: "Transfer Target",
			type: "cognigyText"
		},
		{
			key: "handoverReason",
			label: "Handover Reason",
			type: "cognigyText"
		}
	],
	preview: {
		type: "text",
		key: "transferTarget"
	},
	appearance: {
		color: "#30A4DC"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { transferTarget, handoverReason } = config;

		if (transferTarget && handoverReason)
			api.output(null, {
				"_cognigy": {
					"_audiocodes": {
						"activities": [
							{
								"type": "event",
								"name": "handover",
								"activityParams": {
								"transferTarget": transferTarget,
								"handoverReason": handoverReason
								}
							}					  
						]
					}
				}
			});
	}
});