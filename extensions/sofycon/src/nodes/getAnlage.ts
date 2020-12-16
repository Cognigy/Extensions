import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

// set params
const API_SERVER = 'https://85.214.32.152:90/apiservice/v1/';
const API_ROUTE_ANLAGEDATEN = 'project/anlagedaten';

export interface IGetEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        anlage: string;
        projName: string;
        contextKey: string;
        inputKey: string;
    };
}
// @ts-ignore
export const getAnlage = createNodeDescriptor({
    type: "getAnlage",
    defaultLabel: "GET Anlage",
    preview: {
        key: "anlagennummer",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "API Key",
            type: "connection",
            description: "API Key of defined Robot",
            params: {
                connectionType: "sofycon",
                required: true
            }
        },
        {
            key: "anlage",
            type: "cognigyText",
            label: "Anlagennummer",
            description: "The type of entity you want to search for.",
            params: {
                required: true
            }
        },
        {
            key: "projName",
            type: "cognigyText",
            label: "Mandant",
            description: "The type of entity you want to search for.",
            params: {
                required: true
            }
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "yext.entity",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "yext.entity",
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
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "apiVersion"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "anlage" },
        { type: "field", key: "projName" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#02444f"
    },
    function: async ({ cognigy, config }: IGetEntityParams) => {
        const {api} = cognigy;
        const {anlage, projName, connection, contextKey, inputKey} = config;
        const {key} = connection;

        try {
            const response = await axios({
                method: 'get',
                url: API_SERVER + API_ROUTE_ANLAGEDATEN,
                headers: {
                    'Content-Type': 'application/json',
                    'Allow': 'application/json'
                },
                params: {
                    projName: projName,
                    anlage: anlage
                }
            });

            // @ts-ignore
            api.addToInput(inputKey, response.data);
        } catch (error) {
           // @ts-ignore
            api.addToInput(inputKey, error.message);
        }
    }
});