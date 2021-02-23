import { IConnectionSchema } from "@cognigy/extension-tools";

export const avayaApiConnection: IConnectionSchema = {
    type: "avaya-api",
    label: "Avaya API Key",
    fields: [
        { fieldName: "apiKey" },
        { fieldName: "tenantId" },
        { fieldName: "domain" }
    ]
};