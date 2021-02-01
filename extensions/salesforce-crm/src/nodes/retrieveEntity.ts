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
            type: "select",
            label: "Entity Type",
            defaultValue: "Contact",
            params: {
                options: [
                    {
                        label: "Account",
                        value: "Account"
                    },
                    {
                        label: "Contact",
                        value: "Contact"
                    },
                    {
                        label: "Event",
                        value: "Event"
                    }
                ],
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
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "salesforce.entity",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
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
    function: async ({ cognigy, config }: IRetrieveEntityParams) => {
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

            if (storeLocation === "context") {
                api.addToContext(contextKey, entity, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, entity);
            }

        } catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});