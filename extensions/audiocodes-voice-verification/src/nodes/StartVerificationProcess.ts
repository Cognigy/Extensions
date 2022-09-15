import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IStartVerificationProcessParams extends INodeFunctionBaseParams {
	config: {
		speakerId: string;
	};
}

export const StartVerificationProcessNode = createNodeDescriptor({
	type: "StartVerificationProcess",
	defaultLabel: "Start the verification process for existing users",
	fields: [
		{
			key: "speakerId",
			label: "The AudioCodes speaker ID",
			description: "The ID used to enroll the user to AudioCodes voice verification",
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
	function: async ({ cognigy, config }: IStartVerificationProcessParams) => {
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
									"name": "speakerVerificationVerify",
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