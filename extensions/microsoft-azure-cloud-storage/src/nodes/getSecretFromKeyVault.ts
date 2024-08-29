import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const { SecretClient } = require("@azure/keyvault-secrets");
const { ClientSecretCredential } = require("@azure/identity");

export interface IGetSecretFromKeyVaultParams extends INodeFunctionBaseParams {
  config: {
    connection: {
      clientId: string;
      clientSecret: string;
    };
    tenantId: string;
    vaultName: string;
    secretName: string;
    storeLocation: string;
    inputKey: string;
    contextKey: string;
  };
}

export const getSecretFromKeyVault = createNodeDescriptor({
  type: "getSecretFromAzureKeyVault",
  defaultLabel: "Get Secret",
  fields: [
    {
      key: "connection",
      label: "Key Vault Credentials",
      type: "connection",
      params: {
        connectionType: "azureKeyVault",
        required: true
      }
    },
    {
      key: "tenantId",
      label: "Tenant ID",
      description: "Microsoft Entra tenant (directory) ID",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "vaultName",
      label: "Key Vault Name",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "secretName",
      label: "Secret Name",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "storeLocation",
      type: "select",
      label: "Where to store the result",
      params: {
        options: [
          { label: "Input", value: "input" },
          { label: "Context", value: "context" }
        ],
        required: true
      },
      defaultValue: "input"
    },
    {
      key: "inputKey",
      type: "cognigyText",
      label: "Input Key to store Result",
      defaultValue: "azureSecret",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "azureSecret",
      condition: { key: "storeLocation", value: "context" }
    }
  ],
  sections: [
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"]
    }
  ],
  form: [
    { type: "field", key: "connection" },
    { type: "field", key: "tenantId" },
    { type: "field", key: "vaultName" },
    { type: "field", key: "secretName" },
    { type: "section", key: "storageOption" }
  ],
  appearance: {
    color: "#007fff"
  },
  function: async ({ cognigy, config }: IGetSecretFromKeyVaultParams) => {
    const { api } = cognigy;
    const { connection, tenantId, vaultName, secretName, storeLocation, inputKey, contextKey } = config;
    const { clientId, clientSecret } = connection;

    const vaultUrl = `https://${vaultName}.vault.azure.net`;

    try {
      const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const client = new SecretClient(vaultUrl, credentials);
      const secret = await client.getSecret(secretName);

      if (storeLocation === 'input' && inputKey) {
        // @ts-ignore
        api.addToInput(inputKey, secret.value);
      } else if (storeLocation === 'context' && contextKey) {
        api.addToContext(contextKey, secret.value, 'simple');
      }
    } catch (error) {
      api.log('error', `Azure Storage Extension / Key Vault error: ${error.message}`);
    }
  }
});