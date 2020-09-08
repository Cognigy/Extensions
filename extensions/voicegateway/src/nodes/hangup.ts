import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		hangupReason: string;
	}
}

export const hangupNode = createNodeDescriptor({
	type: "hangup",
	defaultLabel: "Hangup",
	fields: [
		{
			key: "hangupReason",
			label: "Hangup Reason",
			type: "cognigyText"
		}
	],
	appearance: {
		color: "#30A4DC"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { hangupReason } = config;
		
		api.output(null, {
			"_cognigy": {
				"_audiocodes": {
					"activities": [
						{
							"type": "event",
							"name": "hangup",
							"activityParams": {
							  "hangupReason": hangupReason
							}
						  }					  
					]
				}
			}
		});
	}
});