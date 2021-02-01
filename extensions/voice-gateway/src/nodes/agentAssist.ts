import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nodeColor } from '../utils/design';

export interface IAgentAssistParams extends INodeFunctionBaseParams {
	config: {
		activity: "startRecognition" | "stopRecognition";
		targetParticipant: "both" | "caller" | "callee";
	};
}
export const agentAssistNode = createNodeDescriptor({
	type: "agentAssist",
	defaultLabel: "Agent Assist",
	summary: "Configures Agent Assist capabilities",
	fields: [
		{
			key: "activity",
			label: "Activity",
			type: "select",
			description: "Whether to start or stop the recognition of inputs by VG",
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
			description: "Who to apply the setting to",
			defaultValue: "both",
			params: {
				options: [
					{ value: "both", label: "Caller && Callee (Agent)"},
					{ value: "caller", label: "Caller only"},
					{ value: "callee", label: "Callee (Agent) only"},
				]
			}
		}
	],
	appearance: {
		color: nodeColor
	},
	preview: {
		key: "activity",
		type: "text"
	},
	form: [
		{ type: "field", key: "activity" },
		{ type: "field", key: "targetParticipant" }
	],
	function: async ({ cognigy, config }: IAgentAssistParams) => {
		const { api } = cognigy;
		const { activity, targetParticipant } = config;

		if (activity && targetParticipant) {
			let activities = [];

			if (targetParticipant === "both" || targetParticipant === "caller") {
				activities.push(
					{
						"type": "event",
						"name": activity,
						"activityParams": {
						"targetParticipant": "caller"
						}
					}
				);
			}

			if (targetParticipant === "both" || targetParticipant === "callee") {
				activities.push(
					{
						"type": "event",
						"name": activity,
						"activityParams": {
						"targetParticipant": "callee"
						}
					}
				);
			}

			api.output(null, {
				"_cognigy": {
					"_voiceGateway": {
						"json": {
							activities
						}
					}
				}
			});
		}
	}
});
