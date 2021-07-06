import { IConnectionSchema } from "@cognigy/extension-tools";

export const blueprismConnection: IConnectionSchema = {
  type: "blueprism",
  label: "Username and password for the Blueprism RPA web service",
  fields: [
    { fieldName: "username" },
    { fieldName: "password" }
  ]
};