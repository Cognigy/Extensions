import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IStopFunctionParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
        };
        functionId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const stopFunctionNode = createNodeDescriptor({
    type: "stopFunction",
    defaultLabel: "Stop Function",
    summary: "Stops a running Cognigy Function instance",
    fields: [
        {
            key: "connection",
            label: "Cognigy Connection",
            type: "connection",
            params: {
                connectionType: "cognigy-api",
                required: true
            }
        },
        {
            key: "functionId",
            label: "Function ID",
            type: "cognigyText",
            description: "The ID of the function that should be stopped",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            label: "Input Key to store Result",
            defaultValue: "cognigy",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "cognigy",
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
            key: "attachment",
            label: "Attachment",
            defaultCollapsed: false,
            fields: [
                "attachmentName",
                "attachmentUrl"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "functionId" },
        { type: "section", key: "storage" },
    ],
    function: async ({ cognigy, config }: IStopFunctionParams) => {
        const { api, input } = cognigy;
        const { connection, functionId, storeLocation, inputKey, contextKey } = config;
        const { apiKey } = connection;

        try {
            const instancesResponse = await axios({
                method: "get",
                url: `https://api-app.cognigy.ai/new/v2.0/functions/${functionId}/instances`,
                headers: {
                    "Accept": "application/json",
                    "X-API-Key": apiKey
                }
            });


            const instances = instancesResponse.data.items;
            const activeInstances = instances.filter(instance => instance.status === "active");

            for (let activeInstance of activeInstances) {
                try {
                    const activeInstanceResponse = await axios({
                        method: "get",
                        url: `https://api-app.cognigy.ai/new/v2.0/functions/${functionId}/instances/${activeInstance._id}`,
                        headers: {
                            "Accept": "application/json",
                            "X-API-Key": apiKey
                        }
                    });

                    if (activeInstanceResponse.data.parameters.userId === input.userId) {
                        try {
                            const stopInstanceResponse = await axios({
                                method: "post",
                                url: `https://api-app.cognigy.ai/new/v2.0/functions/${functionId}/instances/${activeInstance._id}/stop`,
                                headers: {
                                    "Accept": "application/json",
                                    "X-API-Key": apiKey
                                }
                            });

                            if (storeLocation === "context") {
                                api.addToContext(contextKey, stopInstanceResponse.data, "simple");
                            } else {
                                // @ts-ignore
                                api.addToInput(inputKey, stopInstanceResponse.data);
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
                } catch (error) {
                    if (storeLocation === "context") {
                        api.addToContext(contextKey, error, "simple");
                    } else {
                        // @ts-ignore
                        api.addToInput(inputKey, error);
                    }
                }
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

