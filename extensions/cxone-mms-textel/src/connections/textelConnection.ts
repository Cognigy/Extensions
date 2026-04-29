import { IConnectionSchema } from "@cognigy/extension-tools";

export const textelConnectionData: IConnectionSchema = {
	type: "textelConnection",
	label: "Textel Connection",
	fields: [
        { fieldName: "token" }
	]
};