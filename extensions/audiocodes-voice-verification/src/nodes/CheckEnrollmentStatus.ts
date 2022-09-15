import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICheckEnrollmentStatusParams extends INodeFunctionBaseParams {
	config: {
		speakerId: string;
	};
}

export const CheckEnrollmentStatusNode = createNodeDescriptor({
	type: "CheckEnrollmentStatus",
	defaultLabel: "Check enrollment status of user",
	fields: [
		{
			key: "speakerId",
			label: "The AudioCodes speaker ID",
			description: "The ID used to enroll the user to the AudioCodes voice verification",
			type: "cognigyText",
			params: {
				required: true
			}
		}
	],
	form: [
		{ type: "field", key: "speakerId" },
	],
	appearance: {
		color: "#00539B"
	},
	function: async ({ cognigy, config }: ICheckEnrollmentStatusParams) => {
		const { api } = cognigy;
		const { speakerId } = config;
		try {
			api.output(null, {
				"_cognigy": {
					"_voiceGateway": {
						"json": {
							"activities": [
								{
									"type": "event",
									"name": "speakerVerificationGetSpeakerStatus",
									"sessionParams": {
										"speakerVerificationSpeakerId": speakerId
									}
								}
							]
						}
					}
				}
			});
		} catch (error) {
			api.log("error", error);
		}

	}
});