import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGenerateTextParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
        };
        prompt: number;
        engine: string;
        temperature: number;
        max_tokens: number;
        top_p: number;
        presence_penalty: number;
        frequency_penalty: number;
        useStop: boolean;
        stop: string[];
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const generateTextNode = createNodeDescriptor({
    type: "generateText",
    defaultLabel: {
        default: "Generate Text",
        deDE: "Text erzeugen"
    },
    summary: {
        default: "Generates a new text based on a given prompt",
        deDE: "Erzeugt einen neuen Text auf Grundlage eines vorhandenen Kontext"
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
                default: "Prompt",
                deDE: "Kontext"
            },
            type: "cognigyText",
            description: {
                default: "The prompt to generate completions for, encoded as a string, array of strings, array of tokens, or array of token arrays.",
                deDE: "Die Eingabeaufforderung, für die Vervollständigungen generiert werden sollen, codiert als Zeichenfolge, Array von Zeichenfolgen, Array von Token oder Array von Token-Arrays."
            },
            params: {
                required: true,
                multiline: true
            },
            defaultValue: "Einstein was born in the German Empire, but moved to Switzerland in 1895, forsaking his German citizenship the following year. In 1897, at the age of 17, he enrolled in the mathematics and physics teaching diploma program at the Swiss Federal polytechnic school in Zürich, graduating in 1900. In 1901, he acquired Swiss citizenship, which he kept for the rest of his life, and in 1903 he secured a permanent position at the Swiss Patent Office in Bern. In 1905, he was awarded a PhD by the University of Zurich. In 1914, Einstein moved to Berlin in order to join the Prussian Academy of Sciences and the Humboldt University of Berlin. In 1917, Einstein became director of the Kaiser Wilhelm Institute for Physics; he also became a German citizen again, this time Prussian."
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
            key: "top_p",
            label: {
                default: "Top Temperature",
                deDE: "Maximale Temperatur"
            },
            type: "number",
            description: {
                default: "An alternative to sampling with temperature, called nucleus sampling",
                deDE: "Eine Alternative zum Sampling mit Temperatur, genannt Nucleus Sampling"
            },
            defaultValue: 1
        },
        {
            key: "frequency_penalty",
            label: {
                default: "Frequency Penalty",
                deDE: "Frequenzregelung"
            },
            type: "number",
            description: {
                default: "Number between -2.0 and 2.0",
                deDE: "Zahl zwischen -2,0 und 2,0"
            },
            defaultValue: 0
        },
        {
            key: "presence_penalty",
            label: {
                default: "Presence Penalty",
                deDE: "Gegenwartsregelung"
            },
            type: "number",
            description: {
                default: "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
                deDE: "Zahl zwischen -2,0 und 2,0. Positive Werte bestrafen neue Token basierend darauf, ob sie bisher im Text erschienen sind, und erhöhen die Wahrscheinlichkeit, dass das Modell über neue Themen spricht"
            },
            defaultValue: 0
        },
        {
            key: "useStop",
            label: {
                default: "Use Stops",
                deDE: "Stopps verwenden"
            },
            type: "toggle",
            description: {
                default: "Whether to use a list of stop words to let OpenAI know where the sentence stops",
                deDE: "Ob eine Liste von Stoppwörtern verwendet werden soll, um OpenAI mitzuteilen, wo der Satz endet"
            },
            defaultValue: false
        },
        {
            key: "stop",
            label: {
                default: "Stops",
                deDE: "Stopps"
            },
            type: "textArray",
            description: {
                default: "Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence",
                deDE: "Bis zu 4 Sequenzen, bei denen die API aufhört, weitere Token zu generieren. Der zurückgegebene Text enthält nicht die Stoppsequenz"
            },
            condition: {
                key: "useStop",
                value: true
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
            defaultValue: "openai",
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
            defaultValue: "openai",
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
                "max_tokens",
                "top_p",
                "presence_penalty",
                "frequency_penalty",
                "useStop",
                "stop"
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
    function: async ({ cognigy, config }: IGenerateTextParams) => {
        const { api } = cognigy;
        const { prompt, engine, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, useStop, stop, connection, storeLocation, contextKey, inputKey } = config;
        const { apiKey } = connection;

        try {

            let data: any;

            if (useStop) {
                data = {
                    prompt,
                    temperature,
                    max_tokens,
                    top_p,
                    presence_penalty,
                    frequency_penalty,
                    stop
                };
            } else {
                data = {
                    prompt,
                    temperature,
                    max_tokens,
                    top_p,
                    presence_penalty,
                    frequency_penalty,
                };
            }

            const response = await axios({
                method: "post",
                url: `https://api.openai.com/v1/engines/${engine}/completions`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                data
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