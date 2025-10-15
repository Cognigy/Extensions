import type { IConnectionSchema } from "@cognigy/extension-tools";

export const diffbotConnection: IConnectionSchema = {
	type: "diffbot",
	label: "Diffbot Connection",
	fields: [{ fieldName: "accessToken" }],
};
