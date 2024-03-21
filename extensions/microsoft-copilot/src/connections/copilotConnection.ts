import { IConnectionSchema } from "@cognigy/extension-tools";

export const copilotConnection: IConnectionSchema = {
    type: "microsoft-copilot",
    label: "Copilot Authentication",
    fields: [
        { fieldName: "directLineTokenEndpoint" }
    ]
};