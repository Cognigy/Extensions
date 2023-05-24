import { IConnectionSchema } from "@cognigy/extension-tools";

export const bingConnection: IConnectionSchema = {
    type: "bing",
    label: "Bing Authentication",
    fields: [
        { fieldName: "key" }
    ]
};