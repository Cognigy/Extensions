import { IConnectionSchema } from "@cognigy/extension-tools";

export const sunshineConnection: IConnectionSchema = {
    type: "Sunshine Conversations",
    label: "Holds an API Key ID, Secret and App ID for a Sunshine Conversations App request",
    fields: [
        { fieldName: "keyId"},
        { fieldName: "secret"},
        { fieldName: "appId"}
    ]
};