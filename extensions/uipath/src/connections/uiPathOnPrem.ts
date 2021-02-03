import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathOnPremAccessData: IConnectionSchema = {
	type: "onPremAuth",
	label: "UiPath Connection",
	fields: [
		{ fieldName: "orchestratorUrl" },
        { fieldName: "tenancyName" },
        { fieldName: "usernameOrEmailAddress" },
        { fieldName: "password" }
	]
};