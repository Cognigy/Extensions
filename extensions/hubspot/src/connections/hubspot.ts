import { IConnectionSchema } from "@cognigy/extension-tools";

/**
 * Hubspot uses APIKey-based authentication
 * This connection let's the user enter the hapikey
 */

export const hubspotConnection: IConnectionSchema = {
    type: "hubspot",
    label: "Hubspot Access Token",
    fields: [
        { fieldName: "accessToken" }
    ]
};