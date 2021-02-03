import { IConnectionSchema } from "@cognigy/extension-tools";

export const livechatConnection: IConnectionSchema = {
	type: "salesforceLiveChat",
	label: "Salesforce Live Chat Credentials",
	fields: [
		{ fieldName: "liveAgentUrl" },
		{ fieldName: "organizationId" },
        { fieldName: "deploymentId" },
        { fieldName: "livechatButtonId" }
	]
};