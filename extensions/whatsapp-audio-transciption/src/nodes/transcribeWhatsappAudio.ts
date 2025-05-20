import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

const axios = require('axios');
const FormData = require('form-data');

export interface ITranscribeWhatsappAudio extends INodeFunctionBaseParams {
  config: {
    metaGraphUrl: string,
    metaBearerToken: string,
    azureSpeechEndpoint: string,
    azureSubscriptionKey: string,
    azureSpeechDefinition: string
    storeLocation: string;
    inputKey: string;
    contextKey: string;
  };
}

export const transcribeWhatsappAudio = createNodeDescriptor({
  type: "transcribeWhatsappAudio",
  defaultLabel: "Transcribe",
  preview: { key: "metaAudioUrl", type: "text" },
  fields: [
    {
      key: "metaGraphUrl",
      label: "Meta Graph API URL, which returns the audio file URL",
      description: "URL of the media file",
      type: "cognigyText",
      defaultValue: '{{ input.whatsappMediaUrlResponse.result.url }}',
      params: { required: true }
    },
    {
      key: "metaBearerToken",
      label: "Meta Bearer Token",
      description: "Token used to authenticate with the Meta API",
      defaultValue: '{{ context.env.metaBearerToken }}',
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "azureSpeechEndpoint",
      label: "Azure Speech Endpoint",
      description: "Azure STT API full endpoint URL including version",
      defaultValue: '{{ context.env.azureSpeech.endpoint }}',
      type: "cognigyText",
      params: { required: true }
    },
    {
      key: "azureSubscriptionKey",
      label: "Azure Subscription Key",
      description: "Subscription key put in the Ocp-Apim-Subscription-Key header",
      type: "cognigyText",
      defaultValue: '{{ context.env.azureSpeech.subscriptionKey }}',
      params: { required: true }
    },
    {
      key: "azureSpeechDefinition",
      label: "Azure Speech Definition",
      description: "Optional JSON with STT settings, see https://learn.microsoft.com/en-us/azure/ai-services/speech-service/fast-transcription-create?tabs=locale-specified#request-configuration-options",
      defaultValue: '{ "locales": ["en-US"], "profanityFilterMode": "None" }',
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
      defaultValue: "transcription",
      condition: { key: "storeLocation", value: "input" }
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "transcription",
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
    { type: "field", key: "metaGraphUrl" },
    { type: "field", key: "metaBearerToken" },
    { type: "field", key: "azureSpeechEndpoint" },
    { type: "field", key: "azureSubscriptionKey" },
    { type: "field", key: "azureSpeechDefinition" },
    { type: "section", key: "storageOption" }
  ],
  appearance: { color: "#069af3" },
  function: async ({ cognigy, config }: ITranscribeWhatsappAudio) => {
    const { api } = cognigy;
    const { metaGraphUrl, metaBearerToken, azureSpeechEndpoint, azureSubscriptionKey, azureSpeechDefinition, storeLocation, inputKey, contextKey } = config;

    try {
      // 1. Get audio file URL from Meta Graph API
      const metaResponse = await axios.get(metaGraphUrl, {
        headers: {
          Authorization: `Bearer ${metaBearerToken}`
        }
      });
      const audioUrl = metaResponse.data.url;
      const mimeType = metaResponse.data.mime_type || 'audio/ogg';
      // @ts-ignore
      api.logDebugMessage(audioUrl, 'Fetched audio file URL');

      // 2. Download audio binary from the URL (with Bearer header)
      const audioResponse = await axios.get(audioUrl, {
        headers: {
          Authorization: `Bearer ${metaBearerToken}`
        },
        responseType: 'arraybuffer'
      });
      const audioBuffer = audioResponse.data;
      // @ts-ignore
      api.logDebugMessage(`Size: ${audioBuffer.length} bytes`, 'Downloaded voice message audio file');

      // 3. Prepare multipart/form-data using form-data
      const form = new FormData();
      form.append('audio', audioBuffer, {
        filename: 'Audio.ogg',
        contentType: mimeType
      });
      if (azureSpeechDefinition) {
        form.append('definition', azureSpeechDefinition);
      }

      // 4. POST to Azure Speech-to-Text v4 multipart API
      const azureResponse = await axios.post(
        azureSpeechEndpoint,
        form,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            ...form.getHeaders(),
            'Accept': 'application/json'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          responseType: 'json'
        }
      );

      // @ts-ignore
      api.logDebugMessage(JSON.stringify(azureResponse.data), 'Azure Speech-to-Text API response:');
      if (storeLocation === 'input' && inputKey) {
        // @ts-ignore
        api.addToInput(inputKey, azureResponse.data);
      } else if (storeLocation === 'context' && contextKey) {
        api.addToContext(contextKey, azureResponse.data, 'simple');
      }
    } catch (error) {
      if (error.response) {
        api.log('error', `Transcribe Whatsapp Audio extension response error: ${error.response.status} ${error.response.statusText}`);
        api.log('error', `Transcribe Whatsapp Audio extension response data: ${error.response.data}`);
      } else {
        api.log('error', `Transcribe Whatsapp Audio extension error: ${error.message}`);
      }
      // @ts-ignore
      api.logDebugError(error.message, 'Transcribe Whatsapp Audio extension error');
    }
  }
});