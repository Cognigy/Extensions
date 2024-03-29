import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface IDeleteEntityParams extends INodeFunctionBaseParams {
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
export const deleteEntityNode = createNodeDescriptor({
    type: "deleteEntity",
    defaultLabel: "Delete Entity",
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
            description: "The ID of the Salesforce Entity you want delete",
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
    function: async ({ cognigy, config }: IDeleteEntityParams) => {
        const { api } = cognigy;
        const { entityType, entityId, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;


        try {

            const conn = new jsforce.Connection({
                loginUrl
            });

            const userInfo = await conn.login(username, password);

            // Single record creation
            const entity = await conn.sobject(entityType).destroy(entityId);

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