import { IConnectionSchema } from "@cognigy/extension-tools";

export const cpaasConnection: IConnectionSchema = {
    type: "cpaas",
    label: "CPaaS",
    fields: [
        { fieldName: "domain" },
        { fieldName: "accountSid" },
        { fieldName: "token" }
    ]
};