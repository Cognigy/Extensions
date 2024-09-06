import { IConnectionSchema } from "@cognigy/extension-tools";

export const azureKeyVaultConnection: IConnectionSchema = {
  type: "azureKeyVault",
  label: "Azure Key Vault credentials",
  fields: [
    { fieldName: "clientId" },
    { fieldName: "clientSecret" }
  ]
};