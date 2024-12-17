import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface IQueryParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            instanceUrl: string;
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
    defaultLabel: "Query",
    summary: {
        deDE: "Suche jede Entität mit Salesforce SOQL",
        default: "Search any entity or information in Salesorce using SOQL"
    },
    fields: [
        {
            key: "oauthConnection",
            label: {
                deDE: "Salesforce Connected App",
                default: "Salesforce Connected App",
            },
            type: "connection",
            params: {
                connectionType: "oauth",
                required: true
            }
        },
        {
            key: "soql",
            type: "cognigyText",
            label: {
                deDE: "Salesforce Objektsuche (SOQL)",
                default: "Salesforce Object Query (SOQL)"
            },
            defaultValue: "SELECT Id, Name FROM Contact WHERE Name LIKE 'J%'",
            params: {
                required: true
            }
        },
        {
            key: "maxFetch",
            type: "number",
            label: {
                deDE: "Maximale Anzahl der Abfragen",
                default: "Maximum separate fetches"
            },
            defaultValue: 8,
            description: {
                deDE: "Begrenzt, wie viele separate Abrufe (nicht Datensätze) vor dem Anhalten ausgeführt werden. Zur Begrenzung der Datengröße und der Latenzzeit.",
                default: "Limits how many separate fetch queries (not records) are carried out before stopping. Use to limit data size and latency."
            },
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                deDE: "Ergebnisspeicherung",
                default: "Where to store the result"
            },
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
            label: {
                deDE: "Input Schlüssel für Ergebnisspeicherung",
                default: "Input Key to store Result"
            },
            defaultValue: "salesforce.query",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: {
                deDE: "Context Schlüssel für Ergebnisspeicherung",
                default: "Context Key to store Result"
            },
            defaultValue: "salesforce.query",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        },
    ],
    sections: [
        {
            key: "options",
            label: {
                deDE: "Optionen",
                default: "Options"
            },
            defaultCollapsed: true,
            fields: [
                "maxFetch",
            ]
        },
        {
            key: "storage",
            label: {
                deDE: "Ergebnisspeicherung",
                default: "Storage Option"
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "soql" },
        { type: "section", key: "options" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onFoundQueryResults",
            "onEmptyQueryResults"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IQueryParams) => {
        const { api } = cognigy;
        const { soql, maxFetch, oauthConnection, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(oauthConnection);

            // Run SOQL query:
            const queryResult = await salesforceConnection.query(soql, { autoFetch: true, maxFetch: Number(maxFetch) });

            if (queryResult.records.length === 0) {
                const onEmptyQueryResultsChild = childConfigs.find(child => child.type === "onEmptyQueryResults");
                api.setNextNode(onEmptyQueryResultsChild.id);
            } else {
                const onFoundQueryResultsChild = childConfigs.find(child => child.type === "onFoundQueryResults");
                api.setNextNode(onFoundQueryResultsChild.id);
            }

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

export const onFoundQueryResults = createNodeDescriptor({
    type: "onFoundQueryResults",
    parentType: "salesforceQuery",
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
        variant: "mini",
        showIcon: false
    }
});

export const onEmptyQueryResults = createNodeDescriptor({
    type: "onEmptyQueryResults",
    parentType: "salesforceQuery",
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
        variant: "mini",
        showIcon: false
    }
});