import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface ISearchContactParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            instanceUrl: string;
        };
        contactField: string;
        contactFieldValue: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface ISalesforceContactField {
    name: string;                // API Name of the field (e.g., "FirstName")
    label: string;               // Display label for the field (e.g., "First Name")
    type: string;
    length?: number;
    nillable: boolean;
    custom: boolean;
    defaultedOnCreate: boolean;
    sortable: boolean;
    unique: boolean;
    updateable: boolean;
    calculated: boolean;
    creatable: boolean;
    deprecatedAndHidden: boolean;
}


export const searchContactNode = createNodeDescriptor({
    type: "searchContact",
    defaultLabel: "Search Contact",
    summary: "Find Salesforce Contacts by any field value",
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
            key: "contactField",
            type: "select",
            label: {
                deDE: "Feld",
                default: "Field"
            },
            description: {
                deDE: "Welches Feld zur Kontaktsuche verwendet werden soll",
                default: "Which field should be used for searching for the contact"
            },
            defaultValue: "Phone",
            params: {
                required: true,
            },
            optionsResolver: {
                dependencies: ["oauthConnection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const { consumerKey, consumerSecret, instanceUrl }: ISearchContactParams["config"]["oauthConnection"] = config.oauthConnection;

                        // Step 1: Authenticate with Salesforce using OAuth2
                        const data = `grant_type=client_credentials&client_id=${encodeURIComponent(consumerKey)}&client_secret=${encodeURIComponent(consumerSecret)}`;

                        const authResponse = await api.httpRequest({
                            method: "POST",
                            url: `${instanceUrl}/services/oauth2/token`,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            // @ts-ignore
                            data: data,
                        });

                        // Step 2: Retrieve the metadata for the "Contact" object
                        const describeResponse = await api.httpRequest({
                            method: "GET",
                            url: `${instanceUrl}/services/data/v56.0/sobjects/Contact/describe`,
                            headers: {
                                Authorization: `Bearer ${authResponse?.data?.access_token}`,
                            },
                        });

                        // Step 3: Map the fields to an array with label and name
                        return describeResponse?.data?.fields.map((field: ISalesforceContactField) => ({
                            label: field.label,
                            value: field.name,
                        }));

                    } catch (error) {
                        throw new Error(`Error retrieving Contact fields: ${error.message}`);
                    }
                },
            }
        },
        {
            key: "contactFieldValue",
            type: "cognigyText",
            label: {
                deDE: "Wert",
                default: "Value"
            },
            description: {
                deDE: "Der Wert des ausgewählten Kontaktfeldes",
                default: "The actual value for the selected Contact field"
            },
            defaultValue: "{{input.userId}}",
            params: {
                required: true
            },
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
            defaultValue: "salesforce.contact",
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
            defaultValue: "salesforce.contact",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        },
    ],
    sections: [
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
        { type: "field", key: "contactField" },
        { type: "field", key: "contactFieldValue" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onFoundContact",
            "onNotFoundContact"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ISearchContactParams) => {
        const { api } = cognigy;
        const { contactField, contactFieldValue, oauthConnection, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(oauthConnection);

            const soql: string = `SELECT FIELDS(All) FROM Contact WHERE ${contactField} LIKE '${contactFieldValue}' LIMIT 200`;
            const record = await salesforceConnection.query(soql, { autoFetch: true, maxFetch: 1 });

            if (record.records.length === 0) {
                const onEmptyQueryResultsChild = childConfigs.find(child => child.type === "onNotFoundContact");
                api.setNextNode(onEmptyQueryResultsChild.id);
            } else {
                const onFoundQueryResultsChild = childConfigs.find(child => child.type === "onFoundContact");
                api.setNextNode(onFoundQueryResultsChild.id);
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, record?.records[0], "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, record?.records[0]);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorGetCase");
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

export const onFoundContact = createNodeDescriptor({
    type: "onFoundContact",
    parentType: "searchContact",
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

export const onNotFoundContact = createNodeDescriptor({
    type: "onNotFoundContact",
    parentType: "searchContact",
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
        color: "#cf142b",
        textColor: "white",
        variant: "mini",
        showIcon: false
    }
});