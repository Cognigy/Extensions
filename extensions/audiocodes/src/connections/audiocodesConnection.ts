import { IConnectionSchema } from "@cognigy/extension-tools";

export const audiocodesConnection: IConnectionSchema = {
	type: "audiocodes",
	label: "AudioCodes Base URL",
	fields: [
		{ fieldName: "host" },
		{ fieldName: "port" },
		{ fieldName: "security" },
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "audioCodesUsername" },
		{ fieldName: "audioCodesPassword" },
		{ fieldName: "audioCodesBaseUrl" }
	]
};