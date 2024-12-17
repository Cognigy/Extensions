import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface IEntityRequestParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            instanceUrl: string;
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

interface ISalesforceEntity {
    Label: string;
    QualifiedApiName: string;
}

export const entityRequestNode = createNodeDescriptor({
    type: "entityRequest",
    defaultLabel: {
        deDE: "Entitätenanfrage",
        default: "Entity Request"
    },
    summary: {
        deDE: "Erstellt eine spezielle API Anfrage an Salesforce",
        default: "Sends a custom request to the Salesforce API"
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
            key: "requestType",
            type: "select",
            label: {
                deDE: "Anfrage Typ",
                default: "Request Type"
            },
            defaultValue: "create",
            params: {
                options: [
                    {
                        label: {
                            deDE: "Erstellen",
                            default: "Create"
                        },
                        value: "create"
                    },
                    {
                        label: {
                            deDE: "Erhalten",
                            default: "Retrieve"
                        },
                        value: "retrieve"
                    },
                    {
                        label: {
                            deDE: "Ändern",
                            default: "Update"
                        },
                        value: "update"
                    },
                    {
                        label: {
                            deDE: "Löschen",
                            default: "Delete"
                        },
                        value: "delete"
                    }
                ],
                required: true
            }
        },
        {
            key: "entityType",
            type: "select",
            label: {
                deDE: "Entitätentyp",
                default: "Entity Type"
            },
            defaultValue: "Contact",
            params: {
                required: true
            },
            optionsResolver: {
                dependencies: ["oauthConnection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const { consumerKey, consumerSecret, instanceUrl }: IEntityRequestParams["config"]["oauthConnection"] = config.oauthConnection;

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

                        const accessToken = authResponse?.data?.access_token;

                        const query = `SELECT QualifiedApiName, Label FROM EntityDefinition ORDER BY QualifiedApiName`;
                        const url = `${instanceUrl}/services/data/v56.0/query?q=${encodeURIComponent(query)}`;

                        const response = await api.httpRequest({
                            method: "GET",
                            url: url,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });

                        const records = response?.data?.records || [];

                        // Filter and map results for the desired fields
                        return records.map((entity: ISalesforceEntity) => ({
                            label: entity.Label,
                            value: entity.QualifiedApiName,
                        }));

                    } catch (error) {
                        throw new Error(error);
                    }
                },
            },
        },
        {
            key: "entityId",
            type: "cognigyText",
            label: {
                deDE: "Entitäts-ID",
                default: "Entity ID"
            },
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
            label: {
                deDE: "Entitätseintrag",
                default: "Entity Record"
            },
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
            defaultValue: "salesforce.entity",
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
            defaultValue: "salesforce.entity",
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
        },
        {
            key: "apiVersionSection",
            label: {
                deDE: "API Versionseinstellung",
                default: "API Version Settings"
            },
            defaultCollapsed: true,
            fields: [
                "apiVersion"
            ]
        }
    ],
    form: [
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
        const { oauthConnection, requestType, entityRecord, entityId, entityType, apiVersion, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(oauthConnection, apiVersion);

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