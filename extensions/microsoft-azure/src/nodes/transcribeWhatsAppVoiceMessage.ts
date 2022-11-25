import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ITranscribeWhatsAppVoiceMessageParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        voiceMessageURL: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

const createTranscriptFiles = async (key: string, voiceMessageURL: string) => {
    const createTranscriptionResponse = await axios({
        method: "post",
        url: `https://multiservicecs.cognitiveservices.azure.com/speechtotext/v3.0/transcriptions`,
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: {
            "contentUrls": [
                voiceMessageURL
            ],
            "properties": {
                "diarizationEnabled": false,
                "wordLevelTimestampsEnabled": false,
                "punctuationMode": "DictatedAndAutomatic",
                "profanityFilterMode": "Masked"
            },
            "locale": "en-US",
            "displayName": "Transcription using default model for en-US"
        }
    });

    if (createTranscriptionResponse?.data?.links?.files?.length !== 0) {
        return createTranscriptionResponse?.data?.links?.files;
    } else {
        createTranscriptFiles(key, voiceMessageURL);
    }
};

const getTranscriptFilesContentURL = async (api: any, key: string, transcriptionFilesUrl: string) => {
    const getTranscriptionFilesResponse = await axios({
        method: 'GET',
        url: transcriptionFilesUrl,
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Accept': 'application/json'
        }
    });

    if (getTranscriptionFilesResponse?.data?.values[0]?.links?.contentUrl) {
        return getTranscriptionFilesResponse.data.values[0].links.contentUrl;
    } else {
        getTranscriptFilesContentURL(api, key, transcriptionFilesUrl);
    }
};


export const transcribeWhatsAppVoiceMessageNode = createNodeDescriptor({
    type: "transcribeWhatsAppVoiceMessage",
    defaultLabel: "Transcribe WhatsApp Voice Message",
    fields: [
        {
            key: "connection",
            label: "Cognitive Services API Key",
            type: "connection",
            params: {
                connectionType: "spellcheck",
                required: true
            }
        },
        {
            key: "voiceMessageURL",
            label: "Voice Message URL",
            type: "cognigyText",
            description: "The text that should be checked",
            defaultValue: "{{input.attachments[0].url}}",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "microsoft.azure.transcription",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "microsoft.azure.transcription",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "voiceMessageURL" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#007fff"
    },
    function: async ({ cognigy, config }: ITranscribeWhatsAppVoiceMessageParams) => {
        const { api, input } = cognigy;
        const { connection, voiceMessageURL, storeLocation, inputKey, contextKey } = config;
        const { key } = connection;

        try {

            const transcriptionFilesUrl = await createTranscriptFiles(key, voiceMessageURL);

            api.log('debug', `Transcription Creation: ${transcriptionFilesUrl} Type: ${typeof transcriptionFilesUrl}`);

            const transcriptionFilesContentURL = await getTranscriptFilesContentURL(api, key, transcriptionFilesUrl);

            api.log('debug', `Transcription Files: ${transcriptionFilesContentURL}`);


            const getTranscriptionText = await axios({
                method: 'GET',
                url: decodeURIComponent(transcriptionFilesContentURL),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, getTranscriptionText.data?.combinedRecognizedPhrases, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, getTranscriptionText.data?.combinedRecognizedPhrases);
            }
        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }
        }
    }
});