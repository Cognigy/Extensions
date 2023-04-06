import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IPromptParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
        };
        cognigyPrompt: string;
        maxTokensToSample: number;
        temperature: number;
        topK: number;
        topP: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const promptNode = createNodeDescriptor({
    type: "prompt",
    defaultLabel: {
        default: "Prompt",
    },
    summary: {
        default: "Sends a prompt to Claude for completion"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Anthropic Connection"
            },
            type: "connection",
            params: {
                connectionType: "anthropic",
                required: true
            }
        },
        {
            key: "cognigyPrompt",
            type: "cognigyText",
            label: {
                default: "Prompt"
            },
            defaultValue: "Summarize the following text in one word: {{input.text}}",
            params: {
                required: true
            }
        },
        {
            key: "maxTokensToSample",
            label: {
                default: "Maximal Tokens to sample",
            },
            type: "number",
            defaultValue: 300,
            description: {
                default: "A maximum number of tokens to generate before stopping",
            }
        },
        {
            key: "temperature",
            label: {
                default: "Temperature",
            },
            type: "number",
            defaultValue: 1,
            description: {
                default: "Amount of randomness injected into the response.",
            }
        },
        {
            key: "topK",
            label: {
                default: "Top K",
            },
            type: "number",
            defaultValue: -1,
            description: {
                default: "Only sample from the top K options for each subsequent token.",
            }
        },
        {
            key: "topP",
            label: {
                default: "Top P",
            },
            type: "number",
            defaultValue: -1,
            description: {
                default: "Does nucleus sampling.",
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll"
            },
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
            label: {
                default: "Input Key to store Result",
                deDE: "Input Key zum Speichern des Ergebnisses"
            },
            defaultValue: "anthropic",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result",
                deDE: "Context Key zum Speichern des Ergebnisses"
            },
            defaultValue: "anthropic",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "advanced",
            label: {
                default: "Advanced"
            },
            defaultCollapsed: true,
            fields: [
                "maxTokensToSample",
                "temperature",
                "topK",
                "topP",
            ]
        },
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption"
            },
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
        { type: "field", key: "cognigyPrompt" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "black"
    },
    function: async ({ cognigy, config }: IPromptParams) => {
        const { api } = cognigy;
        const { cognigyPrompt, maxTokensToSample, temperature, topK, topP, connection, storeLocation, contextKey, inputKey } = config;
        const { apiKey } = connection;

        try {

            const response = await axios({
                method: "post",
                url: `https://api.anthropic.com/v1/complete`,
                headers: {
                    "Accept": "application/json",
                    "content-Type": "application/json",
                    "x-api-key": apiKey
                },
                data: {
                    "prompt": `\n\n ${cognigyPrompt} \n\nAssistant:`,
                    "model": "claude-v1",
                    "max_tokens_to_sample": maxTokensToSample,
                    temperature,
                    "top_p": topP,
                    "top_k": topK,
                    "stop_sequences": [
                        "Human:",
                        "Assistant:"
                    ]
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        } catch (error) {
            api.log("error", error.message);
        }
    }
});