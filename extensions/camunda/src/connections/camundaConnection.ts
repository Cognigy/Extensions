import { IConnectionSchema } from "@cognigy/extension-tools";

export const camundaConnection: IConnectionSchema = {
	type: "camunda",
	label: "Camunda Inbound Connector",
	fields: [
		{ fieldName: "bearerToken" },
		{ fieldName: "region" },
		{ fieldName: "clusterId" },
		{ fieldName: "inboundId" }
	]
};
