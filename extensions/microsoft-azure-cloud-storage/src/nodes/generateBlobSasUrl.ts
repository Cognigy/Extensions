import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const { ClientSecretCredential } = require("@azure/identity");
const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol
} = require('@azure/storage-blob');

export interface IGenerateBlobSasUrlParams extends INodeFunctionBaseParams {
  config: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    accountName: string;
    containerName: string;
    blobName: string;
    expiresIn: string;
    permissions: string;
    storeLocation: string;
    inputKey: string;
    contextKey: string;
  };
}

export const generateBlobSasUrl = createNodeDescriptor({
  type: "generateAzureBlobSasUrl",
  defaultLabel: "Blob SAS URL",
  fields: [
    {
      key: "tenantId",
      label: "Tenant ID",
      description: "Microsoft Entra tenant (directory) ID",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "clientId",
      label: "Client ID",
      description: "Client (application) ID of an App Registration in the tenant",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      description: "Client secret that was generated for the App Registration",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "accountName",
      label: "Storage Account Name",
      description: "Azure Storage account name, e.g. \"myaccount\" in https://myaccount.blob.core.windows.net",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "containerName",
      label: "Container Name",
      description: "Name of the container in the given storage account",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "blobName",
      label: "Blob Name",
      description: "Full name including path to the blob, excluding container name, e.g., dir1/dir2/file.ext",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "expiresIn",
      label: "Expires in, seconds",
      description: "Amount of seconds after which the SAS token expires. Default is 10 minutes. Maximum is 7 days",
      type: "cognigyText",
      params: { required: false }
    },
    {
      key: "permissions",
      label: "Permissions String",
      description: "A string comprising first lowercase letters of the required permissions. Defaults to \"r\" = Read. Can include: read, create, add, write, delete",
      type: "cognigyText",
      params: { required: false }
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
      defaultValue: "blobSasUrl",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "blobSasUrl",
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
    { type: "field", key: "tenantId" },
    { type: "field", key: "clientId" },
    { type: "field", key: "clientSecret" },
    { type: "field", key: "accountName" },
    { type: "field", key: "containerName" },
    { type: "field", key: "blobName" },
    { type: "field", key: "expiresIn" },
    { type: "field", key: "permissions" },
    { type: "section", key: "storageOption" }
  ],
  appearance: { color: "#007fff" },
  function: async ({ cognigy, config }: IGenerateBlobSasUrlParams) => {
    const { api } = cognigy;
    const { tenantId, clientId, clientSecret, accountName, containerName, blobName, expiresIn, permissions, storeLocation, inputKey, contextKey } = config;

    const accountUrl = `https://${accountName}.blob.core.windows.net`;

    try {
      const nowMilliseconds = new Date().valueOf();
      const TEN_MINUTES = 60 * 10 * 1000; // Default expiration time for the SAS token

      // Best practice: set start time a little before current time to make sure any clock issues are avoided
      const startsOn = new Date(nowMilliseconds - 10 * 60 * 1000); // 10 minutes before now
      const expiresOn = new Date(nowMilliseconds + (parseInt(expiresIn) || TEN_MINUTES));

      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const blobServiceClient = new BlobServiceClient(accountUrl, credential);
      const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);

      const sasOptions = {
        blobName,
        containerName,
        permissions: BlobSASPermissions.parse(permissions || 'r'), // r = read only by default
        protocol: SASProtocol.Https,
        startsOn,
        expiresOn
      };
      const sasParameters = generateBlobSASQueryParameters(sasOptions, userDelegationKey, accountName).toString();
      const blobSasUrl = `${accountUrl}/${containerName}/${blobName}?${sasParameters}`;

      if (storeLocation === 'input' && inputKey) {
        // @ts-ignore
        api.addToInput(inputKey, blobSasUrl);
      } else if (storeLocation === 'context' && contextKey) {
        api.addToContext(contextKey, blobSasUrl, 'simple');
      }
    } catch (error) {
      api.log('error', `Azure Storage Extension / Generate Blob SAS URL error: ${error.message}`);
    }
  }
});