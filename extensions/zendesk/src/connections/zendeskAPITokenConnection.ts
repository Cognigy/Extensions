import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskAPITokenConnection: IConnectionSchema = {
  type: "zendesk-api-token",
  label: "Zendesk API Token",
  fields: [
    { fieldName: "emailAddress" },
    { fieldName: "apiToken" },
    { fieldName: "subdomain" },
  ],
};
