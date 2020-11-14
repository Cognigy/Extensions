import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { nodeColor } from '../utils/design';

export interface ICallRecordingParams extends INodeFunctionBaseParams {
	config: {
		activity: "startCallRecording" | "stopCallRecording";
		callRecordingServer: string;
		callRecordingId: string;
		callRecordingDestUsername: string;
	};
}
export const callRecordingNode = createNodeDescriptor({
	type: "callRecording",
	defaultLabel: "Call Recording",
	summary: "Configures Call Recording capabilities",
	fields: [
		{
			key: "activity",
			label: "Activity",
			type: "select",
			description: "Whether to start or stop the recording of audio",
			defaultValue: "startRecording",
			params: {
				options: [
					{ value: "startCallRecording", label: "Start Call Recording" },
					{ value: "stopCallRecording", label: "Stop Call Recording" },
				]
			}
		},
		{
			key: "callRecordingServer",
			label: "Call Recording Server",
			type: "cognigyText",
			description: "Defines the SRS as an IP Group name (as configured on the SBC) to record the call.",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "callRecordingId",
			label: "Call Recording ID",
			description: "Defines the recording ID session, which is forwarded by the SBC to the SRS",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "callRecordingDestUsername",
			label: "Destination Username",
			description: "Defines the username that is used in the SIP Request-URI and To headers of the INVITE",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
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
	function: async ({ cognigy, config }: ICallRecordingParams) => {
		const { api } = cognigy;
		const { activity, callRecordingDestUsername, callRecordingId, callRecordingServer } = config;

		if (callRecordingServer && callRecordingId && callRecordingDestUsername) {
			let activities = [];

			if (activity === "startCallRecording") {
				activities.push(
					{
						type: "event",
						name: "startCallRecording",
						activityParams: {
							callRecordingId,
							callRecordingDestUsername,
							callRecordingServer
						}
					}
				);
			}

			if (activity === "stopCallRecording") {
				activities.push(
					{
						type: "event",
						name: "stopCallRecording",
					}
				);
			}

			api.output(null, {
				"_cognigy": {
					"_audioCodes": {
						"json": {
							activities
						}
					}
				}
			});
		}
	}
});
