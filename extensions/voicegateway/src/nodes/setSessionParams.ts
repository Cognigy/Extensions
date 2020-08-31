import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IRequestParams extends INodeFunctionBaseParams {
	config: {
		sessionParams: any;
	}
}

export const setSessionParamsNode = createNodeDescriptor({
	type: "setSessionParams",
	defaultLabel: "Set Session Params",
	fields: [
		{
			key: "sessionParams",
			label: "Session Parameters",
			type: "json",
			defaultValue: {
				"userNoInputTimeoutMS": 1000,
				"userNoInputSendEvent": true,
				"userNoInputRetries": 100
			  }
		}
	],
	appearance: {
		color: "#30A4DC"
	},

	function: async ({ cognigy, config }: IRequestParams) => {
		const { api } = cognigy;
		const { sessionParams } = config;
		if (sessionParams) api.output(null, {
			"_cognigy": {
				"_audiocodes": {
					"activities": [
						{
							"type": "event",
							"name": "config",
							"sessionParams": sessionParams
						  }					  
					]
				}
			}
		});
	}
});