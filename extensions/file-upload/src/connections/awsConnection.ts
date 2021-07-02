import { IConnectionSchema } from "@cognigy/extension-tools";

export const awsConnection: IConnectionSchema = {
	type: "aws",
	label: "AWS S3 IAM Roles",
	fields: [
		{ fieldName: "region" },
		{ fieldName: "accessKeyId"},
		{ fieldName: "secretAccessKey"}
	]
};