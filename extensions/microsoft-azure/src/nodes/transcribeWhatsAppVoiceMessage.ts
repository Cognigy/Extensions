import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const sleep = require('sleep-promise');

export interface ITranscribeWhatsAppVoiceMessageParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
            region: string;
        };
        voiceMessageURL: string;
        language: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

const createTranscriptFiles = async (region: string, key: string, voiceMessageURL: string, language: string) => {

    try {
        const createTranscriptionResponse = await axios({
            method: "post",
            // url: `https://multiservicecs.cognitiveservices.azure.com/speechtotext/v3.0/transcriptions`,
            url: `https://${region}.api.cognitive.microsoft.com/speechtotext/v3.0/transcriptions`,
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
                "locale": language,
                "displayName": `Transcription using default model for ${language}`
            }
        });

        if (createTranscriptionResponse?.data?.links?.files?.length !== 0) {
            return createTranscriptionResponse?.data?.links?.files;
        } else {
            await sleep(1000);
            return await createTranscriptFiles(region, key, voiceMessageURL, language);
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getTranscriptFilesContentURL = async (key: string, transcriptionFilesUrl: string) => {
    const getTranscriptionFilesResponse = await axios({
        method: 'GET',
        url: transcriptionFilesUrl,
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    });
    if (getTranscriptionFilesResponse?.data?.values[0]?.links?.contentUrl) {
        return getTranscriptionFilesResponse?.data?.values[0]?.links?.contentUrl;
    } else {
        await sleep(1000);
        return await getTranscriptFilesContentURL(key, transcriptionFilesUrl);
    }
};

export const transcribeWhatsAppVoiceMessageNode = createNodeDescriptor({
    type: "transcribeWhatsAppVoiceMessage",
    defaultLabel: "Transcribe WhatsApp Voice Message",
    fields: [
        {
            key: "connection",
            label: "Cognitive Services Speech API Key",
            type: "connection",
            params: {
                connectionType: "speechservice",
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
            key: "language",
            type: "select",
            label: "Language",
            defaultValue: "en-US",
            params: {
                options: [
                    {
                        label: "Spanish",
                        value: "es-ES"
                    },
                    {
                        label: "Catalan",
                        value: "es-CL"
                    },
                    {
                        label: "Russian",
                        value: "ru"
                    },
                    {
                        label: "Portuguese",
                        value: "pt-PT"
                    },
                    {
                        label: "Brazilian Portuguese",
                        value: "pt-BR"
                    },
                    {
                        label: "Polish",
                        value: "pl"
                    },
                    {
                        label: "Norwegian",
                        value: "no"
                    },
                    {
                        label: "Korean",
                        value: "ko"
                    },
                    {
                        label: "Japanese",
                        value: "ja"
                    },
                    {
                        label: "Italian",
                        value: "it"
                    },
                    {
                        label: "Swiss German",
                        value: "de-CH"
                    },
                    {
                        label: "German",
                        value: "de-DE"
                    },
                    {
                        label: "Austrian German",
                        value: "de-AT"
                    },
                    {
                        label: "Swiss French",
                        value: "fr-CH"
                    },
                    {
                        label: "French",
                        value: "fr-FR"
                    },
                    {
                        label: "Belgium French",
                        value: "fr-BE"
                    },
                    {
                        label: "Finnish",
                        value: "fi"
                    },
                    {
                        label: "US English",
                        value: "en-US"
                    },
                    {
                        label: "British English",
                        value: "en-GB"
                    },
                    {
                        label: "New Zealand English",
                        value: "en-NZ"
                    },
                    {
                        label: "Australian English",
                        value: "en-AU"
                    },
                    {
                        label: "Dutch",
                        value: "nl-NL"
                    },
                    {
                        label: "Arabic",
                        value: "ar"
                    },
                    {
                        label: "Danish",
                        value: "da"
                    },
                    {
                        label: "Belgium Dutch",
                        value: "nl-BE"
                    }
                ],
                required: true
            },
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
            defaultValue: "transcription",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "transcription",
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
        { type: "field", key: "language" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#007fff"
    },
    dependencies: {
        children: [
            "onTranscriptionSuccess",
            "onTranscriptionError"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ITranscribeWhatsAppVoiceMessageParams) => {
        const { api } = cognigy;
        const { connection, voiceMessageURL, language, storeLocation, inputKey, contextKey } = config;
        const { key, region } = connection;

        try {

            api.log('debug', language);

            const transcriptionFilesUrl = await createTranscriptFiles(region, key, voiceMessageURL, language);

            await sleep(1500);

            const transcriptionFilesContentURL = await getTranscriptFilesContentURL(key, transcriptionFilesUrl);

            await sleep(1500);

            const getTranscriptionText = await axios({
                method: 'GET',
                url: transcriptionFilesContentURL,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, getTranscriptionText.data?.combinedRecognizedPhrases[0].lexical, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, getTranscriptionText.data?.combinedRecognizedPhrases[0].lexical);
            }

            const onSuccess = childConfigs.find(child => child.type === "onTranscriptionSuccess");
            api.setNextNode(onSuccess.id);
        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }

            const onError = childConfigs.find(child => child.type === "onTranscriptionError");
            api.setNextNode(onError.id);
        }
    }
});

export const onTranscriptionSuccess = createNodeDescriptor({
    type: "onTranscriptionSuccess",
    parentType: "transcribeWhatsAppVoiceMessage",
    defaultLabel: {
        default: "On Transcribed"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onTranscriptionError = createNodeDescriptor({
    type: "onTranscriptionError",
    parentType: "transcribeWhatsAppVoiceMessage",
    defaultLabel: {
        default: "On Error"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#EC7373",
        textColor: "white",
        variant: "mini"
    }
});

