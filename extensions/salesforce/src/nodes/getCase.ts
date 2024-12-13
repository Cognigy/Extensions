import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface IGetCaseParams extends INodeFunctionBaseParams {
    config: {
        connectionType: string;
        basicConnection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            loginUrl: string;
        };
        caseNumber: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const getCaseNode = createNodeDescriptor({
    type: "getCase",
    defaultLabel: "Get Case",
    fields: [
        {
            key: "connectionType",
            label: "Connection Type",
            type: "select",
            defaultValue: "oauth",
            params: {
                options: [
                    {
                        label: "OAuth2",
                        value: "oauth"
                    },
                    {
                        label: "Basic Auth",
                        value: "basic"
                    }
                ],
                required: true
            }
        },
        {
            key: "basicConnection",
            label: "Salesforce Credentials",
            type: "connection",
            params: {
                connectionType: "basic",
                required: true
            },
            condition: {
                key: "connectionType",
                value: "basic"
            }
        },
        {
            key: "oauthConnection",
            label: "Salesforce Credentials",
            type: "connection",
            params: {
                connectionType: "oauth",
                required: true
            },
            condition: {
                key: "connectionType",
                value: "oauth"
            }
        },
        {
            key: "caseNumber",
            type: "cognigyText",
            label: "Case Number",
            defaultValue: "",
            params: {
                required: true
            },
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
            defaultValue: "salesforce.case",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce.case",
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
        { type: "field", key: "connectionType" },
        { type: "field", key: "basicConnection" },
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "caseNumber" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    dependencies: {
        children: [
            "onSuccessGetCase",
            "onErrorGetCase"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetCaseParams) => {
        const { api } = cognigy;
        const { caseNumber, connectionType, basicConnection, oauthConnection, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(connectionType, basicConnection, oauthConnection);

            const soql: string = `SELECT FIELDS(All) FROM Case WHERE CaseNumber LIKE '${caseNumber}' LIMIT 200`;
            const record = await salesforceConnection.query(soql, { autoFetch: true, maxFetch: 1 });

            if (record.records.length === 0) {
                const onEmptyQueryResultsChild = childConfigs.find(child => child.type === "onErrorGetCase");
                api.setNextNode(onEmptyQueryResultsChild.id);
            } else {
                const onFoundQueryResultsChild = childConfigs.find(child => child.type === "onSuccessGetCase");
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

export const onSuccessGetCase = createNodeDescriptor({
    type: "onSuccessGetCase",
    parentType: "getCase",
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

export const onErrorGetCase = createNodeDescriptor({
    type: "onErrorGetCase",
    parentType: "getCase",
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