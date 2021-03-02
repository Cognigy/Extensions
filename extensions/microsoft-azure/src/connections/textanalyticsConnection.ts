import { IConnectionSchema } from "@cognigy/extension-tools";

export const textanalyticsConnection: IConnectionSchema = {
	type: "textanalytics",
	label: "Text Analytics API Key and Region",
	fields: [
        { fieldName: "key" },
        { fieldName: "region" }
	]
};