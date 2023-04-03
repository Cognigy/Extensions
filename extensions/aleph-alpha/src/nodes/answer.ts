import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IAnswerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiToken: string;
        };
        query: string;
        text: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const answerNode = createNodeDescriptor({
    type: "answer",
    defaultLabel: {
        default: "Answer Question",
        deDE: "Frage Antworten"
    },
    summary: {
        default: "Answers a question based on a given source text",
        deDE: "Beantwortet eine Frage auf Grundlage eines vorhandenen Textes"
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
            key: "query",
            type: "cognigyText",
            label: {
                default: "Question",
                deDE: "Frage"
            },
            defaultValue: "{{input.text}}",
            params: {
                required: true
            }
        },
        {
            key: "text",
            label: {
                default: "Source Text",
                deDE: "Quelltext"
            },
            type: "cognigyText",
            description: {
                default: "The source text that is used to answer the question",
                deDE: "Der Text, aufgrund dessen die Frage beantwortet wird"
            },
            params: {
                required: true,
                multiline: true
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
            defaultValue: "alephalpha.answers",
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
            defaultValue: "alephalpha.answers",
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
        { type: "field", key: "query" },
        { type: "field", key: "text" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "black"
    },
    dependencies: {
        children: [
            "onFoundAnswer",
            "onNotFoundAnswer"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IAnswerParams) => {
        const { api } = cognigy;
        const { query, text, connection, storeLocation, contextKey, inputKey } = config;
        const { apiToken } = connection;

        try {

            const response = await axios({
                method: "post",
                url: `https://api.aleph-alpha.com/qa`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                data: {
                    query,
                    "documents": [
                      {
                        text
                      }
                    ]
                  }
            });

            if (response.data?.answers?.length !== 0) {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundAnswer");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response.data.answers, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response.data.answers);
                }
            } else {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundAnswer");
                api.setNextNode(onErrorChild.id);
            }
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundAnswer");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});

export const onFoundAnswer = createNodeDescriptor({
    type: "onFoundAnswer",
    parentType: "answer",
    defaultLabel: {
        default: "Found Answer",
        deDE: "Antwort Gefunden",
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

export const onNotFoundAnswer = createNodeDescriptor({
    type: "onNotFoundAnswer",
    parentType: "answer",
    defaultLabel: {
        default: "Not Found",
        deDE: "Nicht Gefunden"
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