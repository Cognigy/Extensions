import { IConnectionSchema } from "@cognigy/extension-tools";

export const apiKey: IConnectionSchema = {
    type: "apiKey",
    label: "Taktile API Key",
    fields: [
        { fieldName: "apiKey" }
    ]
}; 