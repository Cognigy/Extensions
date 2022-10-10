import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IStartEnrollmentProcessParams extends INodeFunctionBaseParams {
	config: {
		speakerId: string;
	};
}

export const StartEnrollmentProcessNode = createNodeDescriptor({
	type: "StartEnrollmentProcess",
	defaultLabel: "Start the enrollment process for new users",
	fields: [
		{
			key: "speakerId",
			label: "The AudioCodes speaker ID",
			description: "The ID to be used to enroll the user to AudioCodes voice verification",
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
	function: async ({ cognigy, config }: IStartEnrollmentProcessParams) => {
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
									"name": "speakerVerificationEnroll",
									"sessionParams": {
										"speakerVerificationType": "text-independent",
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