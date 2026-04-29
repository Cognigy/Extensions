import { IConnectionSchema } from "@cognigy/extension-tools";

export const airtableConnection: IConnectionSchema = {
    type: "airtableConnection",
    label: "AirTable Connection",
    fields: [
        { fieldName: "personalAccessToken" }
    ]
};
