import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface IRetrieveMetadataParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        dataType: string;
        dataFullName: string[];
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const retrieveMetadataNode = createNodeDescriptor({
    type: "retrieveMetadata",
    defaultLabel: "Retrieve Metadata",
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
            key: "dataType",
            type: "cognigyText",
            label: "Data Type",
            params: {
                required: true
            },
        },
        {
            key: "dataFullName",
            type: "textArray",
            label: "Data Full Name",
            description: "The Full Name Metadata Object you wish to retrieve"
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
            defaultValue: "salesforce.metadata.read",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "salesforce.metadata.read",
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
        { type: "field", key: "dataType" },
        { type: "field", key: "dataFullName" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    function: async ({ cognigy, config }: IRetrieveMetadataParams) => {
        const { api } = cognigy;
        const { dataType, dataFullName, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;


        try {

            const conn = new jsforce.Connection({
                loginUrl
            });

            const userInfo = await conn.login(username, password);

            const metadata = await conn.metadata.read(dataType, dataFullName);
            // const metadata = await conn.metadata.list([{type: 'Queue', folder: null}]);

            // const metadata = await conn.metadata.describe();
            // Single record creation
            // const entity = await conn.sobject(entityType).retrieve(entityId);

            if (storeLocation === "context") {
                api.addToContext(contextKey, metadata, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, metadata);
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