import { IConnectionSchema } from "@cognigy/extension-tools";

export const twilioConnection: IConnectionSchema = {
	type: "twilio",
	label: "Twilio Account",
	fields: [
		{ fieldName: "apiKeySid" },
		{ fieldName: "apiKeySecret" },
		{ fieldName: "accountSid" }
	]
};
