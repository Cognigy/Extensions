import { IConnectionSchema } from "@cognigy/extension-tools";

export const powerBIConnection: IConnectionSchema = {
    type: "powerBI",
    label: "PowerBI Authentication",
    fields: [
        { fieldName: "clientId" },
        { fieldName: "tenantId" },
        { fieldName: "username" },
        { fieldName: "password" },
    ]
};