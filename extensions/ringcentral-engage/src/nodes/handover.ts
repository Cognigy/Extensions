import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IHandoverParams extends INodeFunctionBaseParams {
	config: {};
}
export const handoverNode = createNodeDescriptor({
	type: "handoverRingCentral",
	defaultLabel: "Handover",
	fields: [],
	sections: [],
	form: [],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: IHandoverParams) => {
		const { api, input } = cognigy;

		// Send RingCentral Engage Command
		api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "handover"
					}
				}
			}
		});
	}
});