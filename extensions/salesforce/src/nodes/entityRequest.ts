import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface IEntityRequestParams extends INodeFunctionBaseParams {
    config: {
        connectionType: string;
        basicConnection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            loginUrl: string;
        };
        requestType: "create" | "retrieve" | "update" | "delete";
        entityType: string,
        entityRecord: object;
        entityId: string;
        apiVersion: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const entityRequestNode = createNodeDescriptor({
    type: "entityRequest",
    defaultLabel: "Entity Request",
    fields: [
        {
            key: "connectionType",
            label: "Connection Type",
            type: "select",
            defaultValue: "oauth",
            params: {
                options: [
                    {
                        label: "OAuth2",
                        value: "oauth"
                    },
                    {
                        label: "Basic Auth",
                        value: "basic"
                    }
                ],
                required: true
            }
        },
        {
            key: "basicConnection",
            label: "Salesforce Credentials",
            type: "connection",
            params: {
                connectionType: "basic",
                required: true
            },
            condition: {
                key: "connectionType",
                value: "basic"
            }
        },
        {
            key: "oauthConnection",
            label: "Salesforce Credentials",
            type: "connection",
            params: {
                connectionType: "oauth",
                required: true
            },
            condition: {
                key: "connectionType",
                value: "oauth"
            }
        },
        {
            key: "requestType",
            type: "select",
            label: "Request Type",
            defaultValue: "create",
            params: {
                options: [
                    {
                        label: "Create",
                        value: "create"
                    },
                    {
                        label: "Retrieve",
                        value: "retrieve"
                    },
                    {
                        label: "Update",
                        value: "update"
                    },
                    {
                        label: "Delete",
                        value: "delete"
                    }
                ],
                required: true
            }
        },
        {
            key: "entityType",
            type: "cognigyText",
            label: "Entity Type",
            defaultValue: "Contact",
            params: {
                required: true
            },
        },
        {
            key: "entityId",
            type: "cognigyText",
            label: "Entity ID",
            defaultValue: "",
            params: {
                required: true
            },
            condition: {
                key: "requestType",
                value: "create",
                negate: true
            }
        },
        {
            key: "entityRecord",
            type: "json",
            label: "Entity Record",
            defaultValue: `{}`,
            params: {
                required: true
            },
            condition: {
                or: [
                    {
                        key: "requestType",
                        value: "create"
                    },
                    {
                        key: "requestType",
                        value: "update"
                    }
                ]

            }
        },
        {
            key: "apiVersion",
            type: "cognigyText",
            label: "Salesforce API Version",
            defaultValue: "62.0",
            params: {
                required: false
            },
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
            type: "text",
            label: "Input Key to store Result",
            defaultValue: "salesforce.entity",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce.entity",
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
            key: "apiVersionSection",
            label: "API Version Settings",
            defaultCollapsed: true,
            fields: [
                "apiVersion"
            ]
        }
    ],
    form: [
        { type: "field", key: "connectionType" },
        { type: "field", key: "basicConnection" },
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "requestType" },
        { type: "field", key: "entityType" },
        { type: "field", key: "entityId" },
        { type: "field", key: "entityRecord" },
        { type: "section", key: "apiVersionSection" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onSuccessEntityRequest",
            "onErrorEntityRequest"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IEntityRequestParams) => {
        const { api } = cognigy;
        const { connectionType, basicConnection, oauthConnection, requestType, entityRecord, entityId, entityType, apiVersion, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(connectionType, basicConnection, oauthConnection, apiVersion);

            let record: any;

            switch (requestType) {
                case "create":
                    record = await salesforceConnection.sobject(entityType).create(entityRecord);
                    break;
                case "retrieve":
                    record = await salesforceConnection.sobject(entityType).retrieve(entityId);
                    break;
                case "update":
                    const options = Object.assign({ Id: entityId }, entityRecord);
                    record = await salesforceConnection.sobject(entityType).update(options);
                    break;
                case "delete":
                    record = await salesforceConnection.sobject(entityType).destroy(entityId);
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessEntityRequest");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, record, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, record);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorEntityRequest");
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

export const onSuccessEntityRequest = createNodeDescriptor({
    type: "onSuccessEntityRequest",
    parentType: "entityRequest",
    defaultLabel: "On Success",
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
        variant: "mini",
        showIcon: false
    }
});

export const onErrorEntityRequest = createNodeDescriptor({
    type: "onErrorEntityRequest",
    parentType: "entityRequest",
    defaultLabel: "On Error",
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
        color: "#cf142b",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});