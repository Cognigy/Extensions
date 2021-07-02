import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface IQueryParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        soql: string,
        maxFetch: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const queryNode = createNodeDescriptor({
    type: "salesforceQuery",
    defaultLabel: "Query (SOQL)",
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
            key: "soql",
            type: "cognigyText",
            label: "Salesforce Object Query (SOQL)",
            defaultValue: "SELECT Id, Name FROM Contact WHERE Name LIKE 'J%'",
            description: "The SOQL query to run. Refer to Salesforce documentation.",
            params: {
                required: true
            }
        },
        {
            key: "maxFetch",
            type: "number",
            label: "Maximum separate fetches",
            defaultValue: 8,
            description: "Limits how many separate fetch queries (not records) are carried out before stopping. \nUse to limit data size and latency.",
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
            defaultValue: "salesforce.query",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "salesforce.query",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "options",
            label: "Options",
            defaultCollapsed: true,
            fields: [
                "maxFetch",
            ]
        },
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
        { type: "field", key: "soql" },
        { type: "section", key: "options" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    function: async ({ cognigy, config }: IQueryParams) => {
        const { api } = cognigy;
        const { soql, maxFetch, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;


        try {

            const conn = new jsforce.Connection({ loginUrl });

            await conn.login(username, password);

            // Run SOQL query:
            const queryResult = await conn.query(soql, { autoFetch: true, maxFetch: Number(maxFetch) });

            if (storeLocation === "context") {
                api.addToContext(contextKey, queryResult, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, queryResult);
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