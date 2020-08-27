import { IConnectionSchema } from "@cognigy/extension-tools";

export const twilioConnection: IConnectionSchema = {
	type: "twilio",
	label: "Twilio Account",
	fields: [
		{ fieldName: "accountSid" },
		{ fieldName: "authToken"}
	]
};