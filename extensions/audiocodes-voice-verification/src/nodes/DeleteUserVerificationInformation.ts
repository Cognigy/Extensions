import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IDeleteUserVerificationInformationParams extends INodeFunctionBaseParams {
	config: {
		speakerId: string;
	};
}

export const DeleteUserVerificationInformationNode = createNodeDescriptor({
	type: "DeleteUserVerificationInformation",
	defaultLabel: "Delete voice verification profile",
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
	function: async ({ cognigy, config }: IDeleteUserVerificationInformationParams) => {
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
									"name": "speakerVerificationDeleteSpeaker",
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