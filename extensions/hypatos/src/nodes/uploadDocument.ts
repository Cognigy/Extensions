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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "projectId" },
        { type: "field", key: "fileUrl" }
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
        const { api } = cognigy;
        const { connection, projectId, fileUrl } = config;
        const { username, password } = connection;

        try {


            const downloadDocumentResponse = await axios({
                method: "get",
                url: fileUrl,
                responseType: "arraybuffer"
            });

            const form = new FormData();
            form.append('file', downloadDocumentResponse.data, { filename: "document", contentType: downloadDocumentResponse?.headers["content-type"] });

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

            // Store result in Input object
            // @ts-ignore
            api.addToInput("hypatos", response.data);

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessUpload");
            api.setNextNode(onSuccessChild.id);
        } catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorUpload");
            api.setNextNode(onErrorChild.id);
            api.say(JSON.stringify(error));
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