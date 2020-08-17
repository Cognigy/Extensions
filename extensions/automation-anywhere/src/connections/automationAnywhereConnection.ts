import { IConnectionSchema } from "@cognigy/extension-tools";

export const automationAnywhereConnection: IConnectionSchema = {
	type: "automation-anywhere",
	label: "Automation Anywhere Connection",
	fields: [
		{ fieldName: "url" },
		{ fieldName: "username"},
		{ fieldName: "password"}
	]
};