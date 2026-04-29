import { IConnectionSchema } from "@cognigy/extension-tools";

export const nocodbConnection: IConnectionSchema = {
    type: "nocodbConnection",
    label: "NocoDB Connection",
    fields: [
        { fieldName: "serverUrl" },
        { fieldName: "apiToken" }
    ]
};
