import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';

export interface IGetWorkItemParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            token: string;
            organizationUrl: string;
            projectId: string;
        };
        workItemId: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getWorkItemNode = createNodeDescriptor({
    type: "getWorkItem",
    defaultLabel: "Get Work Item",
    summary: "Retrieves a DevOps work item from a project",
    fields: [
        {
            key: "connection",
            label: "Personal Access Token",
            type: "connection",
            params: {
                connectionType: "azuredevops",
                required: true
            }
        },
        {
            key: "workItemId",
            label: "Work Item ID",
            type: "cognigyText",
            defaultValue: "{{context.devOps.workItem.id}}",
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
            defaultValue: "devops.workItem",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "devops.workItem",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
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
        { type: "field", key: "workItemId" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#0067b5"
    },
    dependencies: {
        children: [
            "onFoundWorkItem",
            "onNotFoundWorkItem"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetWorkItemParams) => {
        const { api } = cognigy;
        const { connection, workItemId, storeLocation, inputKey, contextKey } = config;
        const { token, organizationUrl, projectId } = connection;

        try {

            const authHandler = getPersonalAccessTokenHandler(token);
            const azureConnection = new WebApi(organizationUrl, authHandler);
            const workItemApi = await azureConnection.getWorkItemTrackingApi();

            const response = await workItemApi.getWorkItem(
                workItemId,
                [],
                null,
                null,
                projectId
            );

            // check if no item was found
            if (response === null) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundWorkItem");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No work item found for the ID ${workItemId}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No work item found for the ID ${workItemId}`);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundWorkItem");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, response, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, response);
                }
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundWorkItem");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});

export const onFoundWorkItem = createNodeDescriptor({
    type: "onFoundWorkItem",
    parentType: "getWorkItem",
    defaultLabel: "On Found",
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

export const onNotFoundWorkItem = createNodeDescriptor({
    type: "onNotFoundWorkItem",
    parentType: "getWorkItem",
    defaultLabel: "On Not Found",
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

