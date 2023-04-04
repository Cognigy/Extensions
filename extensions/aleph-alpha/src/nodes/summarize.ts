import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISummarizeParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiToken: string;
        };
        text: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const summarizeNode = createNodeDescriptor({
    type: "summarize",
    defaultLabel: {
        default: "Summarize",
        deDE: "Zusammenfassen"
    },
    summary: {
        default: "Creates a summary of a given text",
        deDE: "Erzeugt eine Zusammenfassung eines Textes"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Aleph Alpha Connection",
                deDE: "Aleph Alpha Verbindung"
            },
            type: "connection",
            params: {
                connectionType: "aleph-alpha",
                required: true
            }
        },
        {
            key: "text",
            label: {
                default: "Text",
                deDE: "Text"
            },
            type: "cognigyText",
            description: {
                default: "The text that should be summarized",
                deDE: "Der Text, welcher zusammengefasst werden soll"
            },
            params: {
                required: true,
                multiline: true
            },
            defaultValue: "{{input.text}}"
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
            defaultValue: "alephalpha",
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
            defaultValue: "alephalpha",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
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
        { type: "field", key: "text" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "black"
    },
    function: async ({ cognigy, config }: ISummarizeParams) => {
        const { api } = cognigy;
        const { text, connection, storeLocation, contextKey, inputKey } = config;
        const { apiToken } = connection;

        try {

            const response = await axios({
                method: "post",
                url: `https://api.aleph-alpha.com/summarize`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                data: {
                    "model": "luminous-extended",
                    "document": {
                        text
                    }
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
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