import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetDocumentResultsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
        };
        projectId: string;
        documentId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface IHypatosProject {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
}

export const getDocumentResultsNode = createNodeDescriptor({
    type: "getDocumentResults",
    defaultLabel: {
        default: "Get Document Results",
        deDE: "Erhalte Dokumentenergebnisse"
    },
    summary: {
        default: "Retrieves the results of the uploaded document",
        deDE: "Gibt die Ergebnisse des hochgeladenen Dokuments zurück",
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Hypatos Basic Authentication"
            },
            type: "connection",
            params: {
                connectionType: "hypatos",
                required: true
            }
        },
        {
            key: "projectId",
            label: {
                default: "Project ID",
                deDE: "Projekt ID"
            },
            description: {
                default: "The ID of the Hypatos project",
                deDE: "Die ID des Hypatos Projekts",
            },
            type: "select",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const projectsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api.cloud.hypatos.ai/v1/projects`,
                            headers: {
                                "Accept": "application/json",
                                "Authorization": `Basic ${Buffer.from(config.connection.username + ":" + config.connection.password).toString('base64')}`
                            }
                        });

                        // map file list to "options array"
                        return projectsResponse?.data?.data?.map((project: IHypatosProject) => {
                            return {
                                label: project?.name,
                                value: project?.id,
                            };
                        });
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: "documentId",
            label: {
                default: "Document ID",
                deDE: "Dokumenten ID"
            },
            description: {
                default: "The ID to the document that should be checked for results",
                deDE: "Die ID des Dokumentes welches nach Resultaten überprüft werden soll",
            },
            type: "cognigyText",
            defaultValue: "{{input.hypatos.documentId}}",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll",
                esES: "Dónde almacenar el resultado"
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
            defaultValue: "hypatos",
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
            defaultValue: "hypatos",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        }
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
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "projectId" },
        { type: "field", key: "documentId" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#ff0050"
    },
    dependencies: {
        children: [
            "onProcessing",
            "onExtracted"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetDocumentResultsParams) => {
        const { api } = cognigy;
        const { connection, projectId, documentId, storeLocation, contextKey, inputKey } = config;
        const { username, password } = connection;

        try {

            const response = await axios({
                method: "GET",
                url: `https://api.cloud.hypatos.ai/v1/projects/${projectId}/documents/${documentId}`,
                headers: {
                    "Accept": "application/json"
                },
                auth: {
                    username,
                    password
                }
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

            switch (response.data?.state) {
                case "processing":
                    const onProcessingChild = childConfigs.find(child => child.type === "onProcessing");
                    api.setNextNode(onProcessingChild.id);
                    break;
                case "extracted":
                    const onExtractedChild = childConfigs.find(child => child.type === "onExtracted");
                    api.setNextNode(onExtractedChild.id);
                    break;
                default:
            }

        } catch (error) {
            api.log("error", error.message);
        }
    }
});

export const onProcessing = createNodeDescriptor({
    type: "onProcessing",
    parentType: "getDocumentResults",
    defaultLabel: {
        default: "On Processing",
        deDE: "In Bearbeitung",
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
        color: "#ff0050",
        textColor: "white",
        variant: "mini"
    }
});

export const onExtracted = createNodeDescriptor({
    type: "onExtracted",
    parentType: "getDocumentResults",
    defaultLabel: {
        default: "On Extracted",
        deDE: "Fertig"
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
        color: "#ff0050",
        textColor: "white",
        variant: "mini"
    }
});