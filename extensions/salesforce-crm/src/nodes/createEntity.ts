import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface ICreateEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        entityType: string,
        entityRecord: object;
        apiVersion: string;
        specifyApi: boolean;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const createEntityNode = createNodeDescriptor({
    type: "createEntity",
    defaultLabel: "Create Entity",
    fields: [
        {
            key: "connection",
            label: "Salesforce CRM Credentials",
            type: "connection",
            params: {
                connectionType: "salesforce-crm",
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
            key: "entityRecord",
            type: "json",
            label: "Entity Record",
            defaultValue: `{}`,
            params: {
                required: true
            }
        },
        {
            key: "specifyApi",
            type: "toggle",
            label: "Specify Salesforce API Version",
            defaultValue: false
        },
        {
            key: "apiVersion",
            type: "cognigyText",
            label: "Salesforce API Version",
            defaultValue: "54.0",
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
            condition: {
                key: "specifyApi",
                value: true
            },
            fields: [
                "apiVersion"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "entityType" },
        { type: "field", key: "entityRecord" },
        { type: "field", key: "specifyApi" },
        { type: "section", key: "apiVersionSection" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onSuccessCreateEntity",
            "onErrorCreateEntity"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICreateEntityParams) => {
        const { api } = cognigy;
        const { entityType, entityRecord, specifyApi, apiVersion, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;

        let connectionInfo;

        if (specifyApi === true) {
            connectionInfo = {
                loginUrl,
                version: apiVersion
            };
        } else {
            connectionInfo = {
                loginUrl
            };
        }

        try {

            const conn = new jsforce.Connection(
                connectionInfo);

            const userInfo = await conn.login(username, password);

            // Single record creation
            const record = await conn.sobject(entityType).create(entityRecord);

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessCreateEntity");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, record, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, record);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorCreateEntity");
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

export const onSuccessCreateEntity = createNodeDescriptor({
    type: "onSuccessCreateEntity",
    parentType: "createEntity",
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
        variant: "mini"
    }
});

export const onErrorCreateEntity = createNodeDescriptor({
    type: "onErrorCreateEntity",
    parentType: "createEntity",
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
        variant: "mini"
    }
});