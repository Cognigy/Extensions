import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface ISearchParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        sosl: string,
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const searchNode = createNodeDescriptor({
    type: "salesforceSearch",
    defaultLabel: "Search (SOSL)",
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
            key: "sosl",
            type: "text",
            label: "Salesforce Object Search (SOSL)",
            defaultValue: 'FIND {John OR Jane} IN Name Fields RETURNING Contact(Id,FirstName,LastName)',
            description: "The SOSL query to run. Refer to Salesforce documentation.",
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
            defaultValue: "salesforce.search",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce.search",
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
        { type: "field", key: "sosl" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onFoundResults",
            "onEmptyResults"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchParams) => {
        const { api } = cognigy;
        const { sosl, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;


        try {

            const conn = new jsforce.Connection({ loginUrl });

            await conn.login(username, password);

            // Run SOSL query:
            const searchResult = await conn.search(sosl);

            if (searchResult.searchRecords.length === 0) {
                const onEmptyResultsChild = childConfigs.find(child => child.type === "onEmptyResults");
                api.setNextNode(onEmptyResultsChild.id);
            } else {
                const onFoundChild = childConfigs.find(child => child.type === "onFoundResults");
                api.setNextNode(onFoundChild.id);
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, searchResult, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, searchResult);
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

export const onFoundResults = createNodeDescriptor({
    type: "onFoundResults",
    parentType: "salesforceSearch",
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

export const onEmptyResults = createNodeDescriptor({
    type: "onEmptyResults",
    parentType: "salesforceSearch",
    defaultLabel: "On Empty Result",
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