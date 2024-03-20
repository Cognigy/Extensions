import { IConnectionSchema } from "@cognigy/extension-tools";

export const contentSafetyConnetion: IConnectionSchema = {
    type: "content-safety",
    label: "Content Safety API Key",
    fields: [
        { fieldName: "key" },
        { fieldName: "contentSafetyEndpoint" }
    ]
};