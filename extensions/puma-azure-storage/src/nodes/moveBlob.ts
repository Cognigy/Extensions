import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const { ClientSecretCredential } = require("@azure/identity");
const { BlobClient } = require('@azure/storage-blob');

export interface IMoveBlobParams extends INodeFunctionBaseParams {
  config: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    sourceUrl: string;
    destinationUrl: string;
  };
}

export const moveBlob = createNodeDescriptor({
  type: "moveAzureBlob",
  defaultLabel: "Move Blob",
  preview: { key: "sourceUrl", type: "text" },
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
      key: "sourceUrl",
      label: "Source Blob URL",
      description: "Source blob URL, e.g. https://myaccount.blob.core.windows.net/container-name/blob-name.txt",
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "destinationUrl",
      label: "Destination Blob URL",
      description: "Destination blob URL, e.g. https://myaccount.blob.core.windows.net/container-name/renamed.txt",
      type: "cognigyText",
      params: { required: true }
    }
  ],
  sections: [],
  form: [
    { type: "field", key: "tenantId" },
    { type: "field", key: "clientId" },
    { type: "field", key: "clientSecret" },
    { type: "field", key: "sourceUrl" },
    { type: "field", key: "destinationUrl" }
  ],
  appearance: { color: "#181818" },
  function: async ({ cognigy, config }: IMoveBlobParams) => {
    const { api } = cognigy;
    const { tenantId, clientId, clientSecret, sourceUrl, destinationUrl } = config;

    try {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

      // Copy from the source to the destination
      const destinationBlobClient = new BlobClient(destinationUrl, credential);
      // https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blobclient?view=azure-node-latest#@azure-storage-blob-blobclient-synccopyfromurl
      const copyingResult = await destinationBlobClient.syncCopyFromURL(sourceUrl);
      if (copyingResult?.copyStatus !== 'success') {
        throw new Error(`Copy error: ${JSON.stringify(copyingResult)}`);
      }

      // Delete the source
      const sourceBlobClient = new BlobClient(sourceUrl, credential);
      // https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blobclient?view=azure-node-latest#@azure-storage-blob-blobclient-delete
      const deletionResult = await sourceBlobClient.delete();
      if (deletionResult.errorCode) {
        throw new Error(`Delete error: ${JSON.stringify(deletionResult)}`);
      }
    } catch (error) {
      api.log('error', `Puma Azure Storage extension / Move Blob error: ${error.message}`);
    }
  }
});