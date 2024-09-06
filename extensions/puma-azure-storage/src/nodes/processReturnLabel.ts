import { INodeFunctionBaseParams, createNodeDescriptor } from "@cognigy/extension-tools";
import axios from "axios";
// const { Buffer } = require('buffer');
const { Buffer } = require('node:buffer');
const { BlockBlobClient } = require('@azure/storage-blob');

export interface IProcessReturnLabelParams extends INodeFunctionBaseParams {
  config: {
    carmaUrl: string;
    carmaAuthorization: string;
    carmaRequestBodyString: string;
    blobUploadSasUrl: string;
    storeLocation: string;
    inputKey: string;
    contextKey: string;
  };
}

export const processReturnLabel = createNodeDescriptor({
  type: "processReturnLabel",
  defaultLabel: "Process Return Label",
  preview: { key: "carmaUrl", type: "text" },
  fields: [
    {
      key: "carmaUrl",
      type: "cognigyText",
      label: "Carma URL",
      description: "Full URL of the Carma Return Label API endpoint",
      params: { required: true }
    },
    {
      key: "carmaAuthorization",
      type: "cognigyText",
      label: "Carma Authorization Header",
      description: "The Authorization header of the POST request to the Carma Return Label API",
      params: { required: true }
    },
    {
      key: "carmaRequestBodyString",
      type: "cognigyText", // Type cognigyText is used instead of JSON to work around bug: JSON field unpacks the root array, which results in the Carma request failing
      label: "Carma Request Body",
      description: "Stringified JSON representing the full body of the Carma Return Label API request",
      params: { required: true }
    },
    {
      key: "blobUploadSasUrl",
      type: "cognigyText",
      label: "Upload URL",
      description: "URL with SAS signature, which allows uploading, i.e. has the c or the w permission",
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
      defaultValue: "returnLabelProcessingStatus",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "returnLabelProcessingStatus",
      condition: { key: "storeLocation", value: "context" }
    }
  ],
  sections: [
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: false,
      fields: ["storeLocation", "inputKey", "contextKey"]
    }
  ],
  form: [
    { type: "field", key: "carmaUrl" },
    { type: "field", key: "carmaAuthorization" },
    { type: "field", key: "carmaRequestBodyString" },
    { type: "field", key: "blobUploadSasUrl" },
    { type: "section", key: "storageOption" }
  ],
  appearance: { color: "#181818" },
  function: async ({ cognigy, config }: IProcessReturnLabelParams) => {
    const { api } = cognigy;
    const { carmaUrl, carmaAuthorization, carmaRequestBodyString, blobUploadSasUrl, storeLocation, inputKey, contextKey } = config;

    try {
      // api.log('info', `[X] Attempting a Carma request ${JSON.stringify({
      //   url: carmaUrl,
      //   body: carmaRequestBodyString,
      //   headers: {
      //     'Authorization': carmaAuthorization,
      //     'Content-Type': 'application/json'
      //   }
      // })}`);

      const carmaResponse = await axios.post(
        carmaUrl,
        carmaRequestBodyString,
        {
          headers: {
            'Authorization': carmaAuthorization,
            'Content-Type': 'application/json'
          }
        }
      );
      // api.log('info', '[X] Carma response: ' + carmaResponse.status + ' ' + carmaResponse.statusText);

      const { returnPDFLabelData } = carmaResponse.data[0].details[0];
      // api.log('info', '[X] Base64 PDF length: ' + returnPDFLabelData.length);

      const blobBuffer = Buffer.from(returnPDFLabelData, 'base64');
      // api.log('info', '[X] Blub buffer length: ' + blobBuffer.length);

      const blobResponse = await axios.put(
        blobUploadSasUrl,
        blobBuffer,
        {
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'application/pdf'
          }
        }
      );

      // api.log('info', '[X] PUT blob response: ' + blobResponse.status + ' ' + carmaResponse.statusText);

      /* Block Blob Client upload silently failed, so I implemented this with Axios instead
      // https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobclient?view=azure-node-latest#@azure-storage-blob-blockblobclient-upload
      const blockBlobClient = new BlockBlobClient(blobUploadSasUrl);
      const options = { // https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobuploadoptions
        blobHTTPHeaders: {
          blobContentType: 'application/pdf'
        }
      };
      const uploadBlobResponse = blockBlobClient.upload(blobBuffer, blobBuffer.length, options);
      api.log('info', '[X] Azure Block Blob Client response: ' + JSON.stringify(uploadBlobResponse));*/

      storeResult({ success: true }); // If there was an error, the execution will not get here
    } catch (error) {
      api.log('error', `Puma Azure Storage extension / Process Return Label error: ${error.message}`);
      storeResult({ success: false, error: error.message });
    }

    function storeResult(result: { success: boolean; error?: string }): void {
      if (storeLocation === 'input' && inputKey) {
        // @ts-ignore
        api.addToInput(inputKey, result);
      } else if (storeLocation === 'context' && contextKey) {
        api.addToContext(contextKey, result, 'simple');
      }
    }
  }
});