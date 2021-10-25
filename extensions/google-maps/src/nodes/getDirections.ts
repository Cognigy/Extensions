import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getDirections } from "../helper/getGoogleMapsLocation";

export interface IGetDirectionsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        origin: string;
        destination: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}
export const getDirectionsNode = createNodeDescriptor({
    type: "getDirections",
    defaultLabel: "Get Directions",
    preview: {
        key: "destination",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "API Key",
            type: "connection",
            params: {
                connectionType: "api-key",
                required: true
            }
        },
        {
            key: "origin",
            label: "Origin",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "destination",
            label: "Destination",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "google.directions",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "google.directions",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "zoom",
            ]
        },
        {
            key: "storageOption",
            label: "Storage Option",
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
        { type: "field", key: "origin" },
        { type: "field", key: "destination" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#1e9c6d"
    },
    function: async ({ cognigy, config }: IGetDirectionsParams) => {
        const { api } = cognigy;
        let { connection, origin, destination, storeLocation, inputKey, contextKey } = config;
        const { key } = connection;

        try {

            const routes = await getDirections(key, origin, destination);

            if (storeLocation === "context") {
                api.addToContext(contextKey, routes, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, routes);
            }

        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }
        }
    }
});