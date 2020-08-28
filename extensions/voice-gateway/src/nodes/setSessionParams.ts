import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISetSessionParams extends INodeFunctionBaseParams {
	config: {
		sessionParams: any;
	};
}
export const setSessionParamsNode = createNodeDescriptor({
	type: "setSessionParams",
	defaultLabel: "Set Session Parameters",
	fields: [
		{
			key: "sessionParams",
			label: "Session Parameter",
			type: "json",
			defaultValue: "{}",
			params: {
				required: true
			}
		},
	],
	form: [
		{ type: "field", key: "sessionParams" }
	],
	function: async ({ cognigy, config }: ISetSessionParams) => {
		const { api } = cognigy;
		const { sessionParams } = config;

		if (!sessionParams) throw new Error('The Session Parameters are missing.');

		api.output('', {
			"_cognigy": {
				"_audioCodes": {
					"json": {
						"activities": [
							{
								"type": "event",
								"name": "config",
								sessionParams
							}
						]
					}
				}
			}
		});
	}
});