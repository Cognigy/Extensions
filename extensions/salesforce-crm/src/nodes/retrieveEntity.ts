import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface IRetrieveEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        entityType: string,
        entityId: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const retrieveEntityNode = createNodeDescriptor({
    type: "retrieveEntity",
    defaultLabel: "Retrieve Entity",
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
            key: "entityId",
            type: "cognigyText",
            label: "Entity ID",
            defaultValue: "{{input.salesforce.entity.id}}",
            description: "The ID of the Salesforce Entity you want to get",
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
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "entityType" },
        { type: "field", key: "entityId" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onFoundEntity",
            "onNotFoundEntity"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IRetrieveEntityParams) => {
        const { api } = cognigy;
        const { entityType, entityId, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;


        try {

            const conn = new jsforce.Connection({
                loginUrl
            });

            const userInfo = await conn.login(username, password);

            // Single record creation
            const entity = await conn.sobject(entityType).retrieve(entityId);

            const onFoundChild = childConfigs.find(child => child.type === "onFoundEntity");
            api.setNextNode(onFoundChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, entity, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, entity);
            }

        } catch (error) {

            const onNotFoundChild = childConfigs.find(child => child.type === "onNotFoundEntity");
            api.setNextNode(onNotFoundChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});

export const onFoundEntity = createNodeDescriptor({
    type: "onFoundEntity",
    parentType: "retrieveEntity",
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

export const onNotFoundEntity = createNodeDescriptor({
    type: "onNotFoundEntity",
    parentType: "retrieveEntity",
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