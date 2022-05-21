import { IConnectionSchema } from "@cognigy/extension-tools";

export const workdayConnection: IConnectionSchema = {
	type: "workday",
	label: "Workday Authentication",
	fields: [
		{ fieldName: "tenantHostname" }
	]
};