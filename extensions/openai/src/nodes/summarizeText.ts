import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISummarizeTextParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
        };
        prompt: number;
        engine: string;
        temperature: number;
        max_tokens: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const summarizeTextNode = createNodeDescriptor({
    type: "summarizeText",
    defaultLabel: {
        default: "Summarize Text",
        deDE: "Text zusammenfassen"
    },
    summary: {
        default: "Summarizes a given text",
        deDE: "Fasst einen Text zusammen"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "OpenAI Connection",
                deDE: "OpenAI Verbindung"
            },
            type: "connection",
            params: {
                connectionType: "openai",
                required: true
            }
        },
        {
            key: "prompt",
            label: {
                default: "Text",
                deDE: "Text"
            },
            type: "cognigyText",
            description: {
                default: "The text that should be summarized",
                deDE: "Der Text welcher zusammengefasst werden soll"
            },
            params: {
                required: true,
                multiline: true
            }
        },
        {
            key: "engine",
            type: "select",
            label: {
                default: "The GPT-3 engine that should be used",
                deDE: "Die GPT-3 Maschine, welche verwendet werden soll"
            },
            defaultValue: "davinci",
            params: {
                options: [
                    {
                        label: "Da Vinci",
                        value: "davinci"
                    },
                    {
                        label: "Ada",
                        value: "ada"
                    },
                    {
                        label: "Curie",
                        value: "curie"
                    },
                    {
                        label: "Babbage",
                        value: "babbage"
                    }
                ]
            }
        },
        {
            key: "temperature",
            label: {
                default: "Temperature",
                deDE: "Temperatur"
            },
            type: "slider",
            description: {
                default: "What sampling temperature to use. Higher values means the model will take more risks",
                deDE: "Welche Probenahmetemperatur soll verwendet werden. Höhere Werte bedeuten, dass das Modell mehr Risiken eingeht"
            },
            defaultValue: 0.3,
            params: {
                min: 0,
                max: 1,
                step: 0.1
            }
        },
        {
            key: "max_tokens",
            label: {
                default: "Maximal Tokens",
                deDE: "Maximale Zeichen"
            },
            type: "number",
            description: {
                default: "The maximum number of tokens to generate in the completion",
                deDE: "Die maximale Anzahl von Token, die beim Abschluss generiert werden sollen"
            },
            defaultValue: 60
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
            defaultValue: "summary",
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
            defaultValue: "summary",
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
                default: "Advanced",
                deDE: "Erweitert"
            },
            defaultCollapsed: true,
            fields: [
                "engine",
                "temperature",
                "max_tokens"
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
        { type: "field", key: "prompt" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "black"
    },
    function: async ({ cognigy, config }: ISummarizeTextParams) => {
        const { api } = cognigy;
        const { prompt, engine, temperature, max_tokens, connection, storeLocation, contextKey, inputKey } = config;
        const { apiKey } = connection;

        try {

            const response = await axios({
                method: "post",
                url: `https://api.openai.com/v1/engines/${engine}/completions`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                data: {
                    prompt,
                    temperature,
                    max_tokens,
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data?.choices[0]?.text, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data?.choices[0]?.text);
            }
        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error });
            }
        }
    }
});