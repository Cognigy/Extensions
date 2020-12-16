import { IConnectionSchema } from "@cognigy/extension-tools";

export const defaultConnection: IConnectionSchema = {
    type: "sofycon",
    label: "Robot API Key",
    fields: [
        { fieldName: "apikey" }
    ]
};