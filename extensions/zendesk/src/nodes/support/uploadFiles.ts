import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IUploadFilesParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            subdomain: string;
        };
        filesJson: any;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const uploadFilesNode = createNodeDescriptor({
    type: "uploadFiles",
    defaultLabel: {
        default: "Upload Files",
        deDE: "Dateien hochladen",
        esES: "Subir archivos"
    },
    summary: {
        default: "Uploads files from the Cognigy File Upload for Zendesk Tickets",
        deDE: "Lädt Dateien vom Cognigy-Dateiupload für Zendesk-Tickets hoch",
        esES: "Carga archivos desde la Carga de archivos de Cognigy para tickets de Zendesk"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Zendesk Connection",
                deDE: "Zendesk Verbindung",
                esES: "Zendesk Conexión"
            },
            type: "connection",
            params: {
                connectionType: "zendesk",
                required: true
            }
        },
        {
            key: "filesJson",
            label: {
                default: "Files as array",
                deDE: "Dateien als Array",
                esES: "Files as array"
            },
            type: "json",
            defaultValue: [],
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
                deDE: "Input Key zum Speichern des Ergebnisses",
                esES: "Input Key para almacenar el resultado"
            },
            defaultValue: "zendesk.uploads",
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
                deDE: "Context Key zum Speichern des Ergebnisses",
                esES: "Context Key para almacenar el resultado"
            },
            defaultValue: "zendesk.uploads",
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
                deDE: "Speicheroption",
                esES: "Opción de almacenamiento"
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
        { type: "field", key: "filesJson" },
		{ type: "section", key: "storage" },
    ],
    appearance: {
        color: "#00363d"
    },

    function: async ({ cognigy, config }: IUploadFilesParams) => {
        const { api } = cognigy;
        const { connection, filesJson, storeLocation, contextKey, inputKey } = config;
        const { username, password, subdomain } = connection;

        const zendesk = axios.create({
            baseURL: `https://${subdomain}.zendesk.com/api/v2`,
            headers: {
                Authorization:
                    `Basic ${Buffer.from(`${username}/token:${password}`).toString('base64')}`,
            },
            timeout: 30000
        });

        const http = axios.create({ timeout: 30000 });

        try {
            const uploads: any[] = [];
            let sessionToken: string | null = null;
            api.addToContext("test", filesJson, "simple");
            const tokenArray = [];

            for (const file of filesJson) {
                const stream = await http.get(file.url, { responseType: "stream" });

                const filename = encodeURIComponent(file.originalName);
                const mimeType = file.type || stream.headers["content-type"] || "application/octet-stream";
                const tokenParam = sessionToken ? `&token=${sessionToken}` : "";

                const { data } = await zendesk.post(
                  `/uploads.json?filename=${filename}${tokenParam}`,
                  stream.data,
                  { headers: { "Content-Type": mimeType } }
                );

                uploads.push(data.upload);
                tokenArray.push(data.upload.token);
                sessionToken = data.upload.token;      // chain next file
              }


            if (storeLocation === "context") {
                api.addToContext(contextKey, uploads, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, uploads);

            }
        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error.message }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});