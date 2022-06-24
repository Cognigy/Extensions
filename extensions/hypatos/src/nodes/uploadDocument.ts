import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
const FormData = require('form-data');

export interface IUploadDocumentParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
        };
        projectId: string;
        fileUrl: string;
        externalData: string;
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

export const uploadDocumentNode = createNodeDescriptor({
    type: "uploadDocument",
    defaultLabel: {
        default: "Upload Document",
        deDE: "Dokument hochladen"
    },
    summary: {
        default: "Uploads a user document to Hypatos",
        deDE: "Lädt ein Nutzerdokument zu Hypatos hoch",
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
            key: "fileUrl",
            label: {
                default: "File Url",
                deDE: "Dokument / Datei URL"
            },
            description: {
                default: "The url to the file that should be uploaded as a document",
                deDE: "Die URL zur Datei welche als Dokument hochgeladen werden soll",
            },
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "externalData",
            label: {
                default: "Additional Data",
                deDE: "Weitere Daten"
            },
            description: {
                default: "A JSON object with additional data that should be used to validate the uploaded file",
                deDE: "Weitere Daten, die helfen das hochgeladene Dokument zu validieren",
            },
            type: "json",
            defaultValue: {}
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
            key: "externalDataSection",
            label: {
				default: "Additional Data",
				deDE: "Weitere Daten"
			},
            defaultCollapsed: true,
            fields: [
                "externalData"
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
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "projectId" },
        { type: "field", key: "fileUrl" },
        { type: "section", key: "externalDataSection" },
        { type: "section", key: "storage"}
    ],
    appearance: {
        color: "#ff0050"
    },
    dependencies: {
        children: [
            "onSuccessUpload",
            "onErrorUpload"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IUploadDocumentParams) => {
        const { api, input } = cognigy;
        const { connection, projectId, fileUrl, externalData, storeLocation, contextKey, inputKey } = config;
        const { username, password } = connection;

        try {


            const downloadDocumentResponse = await axios({
                method: "get",
                url: fileUrl,
                responseType: "arraybuffer"
            });

            const form = new FormData();
            form.append('file', downloadDocumentResponse.data, { filename: `cognigy-${input.inputId}`, contentType: downloadDocumentResponse?.headers["content-type"] });
            form.append('externalData', JSON.stringify(externalData));

            const response = await axios({
                method: "POST",
                url: `https://api.cloud.hypatos.ai/v1/projects/${projectId}/documents/upload`,
                headers: form.getHeaders(),
                auth: {
                    username,
                    password
                },
                data: form
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessUpload");
            api.setNextNode(onSuccessChild.id);
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorUpload");
            api.setNextNode(onErrorChild.id);
            api.log("error", error.message);
        }
    }
});


export const onSuccessUpload = createNodeDescriptor({
    type: "onSuccessUpload",
    parentType: "uploadDocument",
    defaultLabel: {
        default: "On Success",
        deDE: "Erfolgreich",
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

export const onErrorUpload = createNodeDescriptor({
    type: "onErrorUpload",
    parentType: "uploadDocument",
    defaultLabel: {
        default: "On Error",
        deDE: "Fehlerhaft"
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
        color: "red",
        textColor: "white",
        variant: "mini"
    }
});