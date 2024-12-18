import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface ICreateCaseParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            instanceUrl: string;
        };
        Status: string;
        Origin: string;
        Subject: string;
        Description: string;
        additionalCaseDetails: object;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

interface ISalesforceCaseStatus {
    attributes: any[];
    Id: string;
    MasterLabel: string;
    SortOrder: number;
    IsDefault: boolean;
    IsClosed: boolean;
}

interface SalesforceCase {
    Id: string;
    CaseNumber: string;
}

export const createCaseNode = createNodeDescriptor({
    type: "createCase",
    defaultLabel: {
        deDE: "Case erstellen",
        default: "Create Case",
    },
    summary: {
        deDE: "Erstelle einen detaillierten Salesforce Case",
        default: "Create a detailed Salesforce Case",
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
            key: "Status",
            type: "select",
            label: {
                deDE: "Status",
                default: "Status",
            },
            params: {
                required: true
            },
            optionsResolver: {
                dependencies: ["oauthConnection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const { consumerKey, consumerSecret, instanceUrl }: ICreateCaseParams["config"]["oauthConnection"] = config.oauthConnection;

                        const data = `grant_type=client_credentials&client_id=${encodeURIComponent(consumerKey)}&client_secret=${encodeURIComponent(consumerSecret)}`;

                        // Step 1: Authenticate with Salesforce using OAuth2
                        const authResponse = await api.httpRequest({
                            method: "POST",
                            url: `${instanceUrl}/services/oauth2/token`,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            // @ts-ignore
                            data: data
                        });

                        // Step 2: Query Salesforce to get Case Statuses
                        const queryResponse = await api.httpRequest({
                            method: "GET",
                            url: `${instanceUrl}/services/data/v56.0/query?q=${encodeURIComponent(
                                "SELECT Id, MasterLabel FROM CaseStatus"
                            )}`,
                            headers: {
                                Authorization: `Bearer ${authResponse?.data?.access_token}`,
                            },
                        });

                        const statuses: ISalesforceCaseStatus[] = queryResponse?.data?.records;

                        // Step 3: Map statuses to "options array"
                        return statuses.map((status: ISalesforceCaseStatus) => ({
                            label: status.MasterLabel,
                            value: status.Id,
                        }));
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: "Origin",
            type: "select",
            label: {
                deDE: "Herkunft",
                default: "Origin"
            },
            params: {
                required: true
            },
            optionsResolver: {
                dependencies: ["oauthConnection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const { consumerKey, consumerSecret, instanceUrl }: ICreateCaseParams["config"]["oauthConnection"] = config.oauthConnection;

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

                        // Step 2: Retrieve picklist values for the 'Case.Origin' field
                        const metadataResponse = await api.httpRequest({
                            method: "GET",
                            url: `${instanceUrl}/services/data/v56.0/sobjects/Case/describe`,
                            headers: {
                                Authorization: `Bearer ${authResponse?.data?.access_token}`,
                            },
                        });

                        const fields = metadataResponse?.data?.fields || [];
                        const originField = fields.find((field: any) => field.name === 'Origin');

                        // Step 3: Map active picklist values to the options array
                        return originField.picklistValues
                            .filter((picklistValue: any) => picklistValue.active)
                            .map((picklistValue: any) => ({
                                label: picklistValue.label,
                                value: picklistValue.label,
                            }));

                    } catch (error) {
                        throw new Error(error);
                    }
                },
            }
        },
        {
            key: "Subject",
            type: "cognigyText",
            label: {
                deDE: "Betreff",
                default: "Subject"
            },
            defaultValue: "",
            params: {
                required: true
            },
        },
        {
            key: "Description",
            type: "cognigyText",
            label: {
                deDE: "Beschreibung",
                default: "Description"
            },
            defaultValue: "{{input.text}}",
            params: {
                required: true
            },
        },
        {
            key: "additionalCaseDetails",
            type: "json",
            label: {
                deDE: "Weitere Case Details",
                default: "Additional Case Details"
            },
            defaultValue: `{}`,
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
            defaultValue: "salesforce.case",
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
            defaultValue: "salesforce.case",
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
            key: "advanced",
            label: {
                deDE: "Erweitert",
                default: "Advanced"
            },
            defaultCollapsed: true,
            fields: ["additionalCaseDetails"]
        },
    ],
    form: [
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "Status" },
        { type: "field", key: "Origin" },
        { type: "field", key: "Subject" },
        { type: "field", key: "Description" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onSuccessCreateCase",
            "onErrorCreateCase"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICreateCaseParams) => {
        const { api } = cognigy;
        const { Status, Origin, Subject, Description, additionalCaseDetails, oauthConnection, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(oauthConnection);

            // Single record creation
            const record = await salesforceConnection.sobject("Case").create({
                Status,
                Origin,
                Subject,
                Description,
                ...additionalCaseDetails
            });

            const queryRecord = await salesforceConnection.query<SalesforceCase>(`SELECT Id, CaseNumber from Case Where Id = '${record?.id}'`);

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessCreateCase");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, queryRecord?.records[0], "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, queryRecord?.records[0]);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorCreateCase");
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

export const onSuccessCreateCase = createNodeDescriptor({
    type: "onSuccessCreateCase",
    parentType: "createCase",
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

export const onErrorCreateCase = createNodeDescriptor({
    type: "onErrorCreateCase",
    parentType: "createCase",
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