import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { ICognigyNodeFunctionParams } from "@cognigy/extension-tools/build/interfaces/descriptor";
import axios from 'axios';
import { userAgent } from "../version";

export interface IDetectLanguageParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        text: string;
        provider: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const langDetectNode = createNodeDescriptor({
    type: "detectLanguageInText",
    defaultLabel: "Detect Language",
    preview: {
        key: "text",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "APIKEY",
            type: "connection",
            params: {
                connectionType: "intento-connection",
                required: true
            }
        },
        {
            key: "text",
            label: "Text",
            type: "cognigyText",
            defaultValue: "{{input.text}}",
            params: {
                required: true,
            },
        },
        {
            key: "provider",
            label: "Language detection provider",
            type: "select",
            defaultValue: "ai.text.detect-language.microsoft.text_analytics_api.2-1",
            params: {
                required: true,
                options: [
                    { label: 'Microsoft', value: 'ai.text.detect-language.microsoft.text_analytics_api.2-1' },
                    { label: 'Google Cloud', value: 'ai.text.detect-language.google.translate_api.v3' },
                    { label: 'IBM Watson', value: 'ai.text.detect-language.ibm-language-translator-v3' }
                ]
            },
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
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
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "detectedLanguage",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "detectedLanguage",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "text" },
        { type: "field", key: "provider" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#2a48e1"
    },
    function: async ({ cognigy, config }: ICognigyNodeFunctionParams) => {
        const { api } = cognigy;
        const { text, provider, connection, storeLocation, contextKey, inputKey } = config as IDetectLanguageParams["config"];
        const { key } = connection;
        const intentoBody = {
            "context": {
                "text": text
            },
            "service": {
                "provider": provider
            }
        };
        try {
            const maxRetries = 5;
            const baseDelay = 1000; // 1 second
            let attempt = 0;
            while (attempt < maxRetries) {
                try {
                    const response = await axios({
                        method: 'post',
                        url: 'https://api.inten.to/ai/text/detect-language',
                        headers: {
                            'User-Agent': userAgent,
                            'Content-Type': 'application/json',
                            'apikey': key
                        },
                        data: intentoBody,
                    });

                    if (storeLocation === "context") {
                        api.addToContext(contextKey, response.data["results"][0][0]["language"], "simple");
                    } else {
                        api.addToInput(inputKey, response.data["results"][0][0]["language"]);
                    }
                    return; // Exit the function if the request is successful
                } catch (error: any) {
                    attempt++;
                    if (attempt >= maxRetries) {
                        if (storeLocation === "context") {
                            api.addToContext(contextKey, error?.message, "simple");
                        } else {
                            api.addToInput(inputKey, error?.message);
                        }
                        return; // Exit the function if max retries are reached
                    }
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } catch (error: any) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error?.message, "simple");
            } else {
                api.addToInput(inputKey, error?.message);
            }
        }
    }
});
