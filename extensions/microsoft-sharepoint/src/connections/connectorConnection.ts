import { IConnectionSchema } from "@cognigy/extension-tools";

export const connectorConnection: IConnectionSchema = {
    type: "connector",
    label: "Sharepoint Connection",
    fields: [
        { fieldName: "tenantId" },
        { fieldName: "clientId" },
        { fieldName: "clientSecret"},

    ]
};