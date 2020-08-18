import { IConnectionSchema } from "@cognigy/extension-tools";

export const awsConnection: IConnectionSchema = {
	type: "aws",
	label: "AWS Polly IAM Roles",
	fields: [
		{ fieldName: "region" },
		{ fieldName: "accessKeyId"},
		{ fieldName: "secretAccessKey"}
	]
};