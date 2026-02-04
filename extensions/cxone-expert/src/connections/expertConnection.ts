import { IConnectionSchema } from "@cognigy/extension-tools";

export const expertApiKeyData: IConnectionSchema = {
    type: "expertConnection",
    label: "Expert Connection",
    fields: [
        { fieldName: "serverKey" },
        { fieldName: "serverSecret" }
    ]
};