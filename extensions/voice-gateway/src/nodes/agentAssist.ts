import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IAgentAssistParams extends INodeFunctionBaseParams {
	config: {
		activity: string;
		targetParticipant: string;
	};
}
export const agentAssistNode = createNodeDescriptor({
	type: "agentAssist",
	defaultLabel: "Agent Assist",
	fields: [
		{
			key: "activity",
			label: "Activity",
			type: "select",
			defaultValue: "startRecognition",
			params: {
				options: [
					{ value: "startRecognition", label: "Start Recognition"},
					{ value: "stopRecognition", label: "Stop Recognition"},
				]
			}	
		},
		{
			key: "targetParticipant",
			label: "Target Participant",
			type: "select",
			defaultValue: "caller",
			params: {
				options: [
					{ value: "caller", label: "Caller"},
					{ value: "callee", label: "Callee (Agent)"},
				]
			}	
		}
	],
	appearance: {
		color: "#F5A623"
	},
	form: [
		{ type: "field", key: "activity" },
		{ type: "field", key: "targetParticipant" }
	],
	function: async ({ cognigy, config }: IAgentAssistParams) => {
		const { api } = cognigy;
		const { activity, targetParticipant } = config;

		if (activity && targetParticipant)
			api.output('', {
				"_cognigy": {
					"_audioCodes": {
						"json": {
							"activities": [
								{
									"type": "event",
									"name": activity,
									"activityParams": {
									"targetParticipant": targetParticipant
									}
								}
							]
						}
					}
				}
			});
	}
});
