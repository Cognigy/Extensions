import { IConnectionSchema } from "@cognigy/extension-tools";

export const blueprismConnection: IConnectionSchema = {
  type: "blueprismCredentials",
  label: "Username and password for a Blueprism RPA instance",
  fields: [
    { fieldName: "username" },
    { fieldName: "password" }
  ]
};