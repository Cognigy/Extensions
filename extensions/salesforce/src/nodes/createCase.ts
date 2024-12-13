import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface ICreateCaseParams extends INodeFunctionBaseParams {
    config: {
        connectionType: string;
        basicConnection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        oauthConnection: {
            clientId: string;
            clientSecret: string;
            loginUrl: string;
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
export const createCaseNode = createNodeDescriptor({
    type: "createCase",
    defaultLabel: "Create Case",
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
            key: "Status",
            type: "cognigyText",
            label: "Status",
            defaultValue: "NEW",
            params: {
                required: true
            },
        },
        {
            key: "Origin",
            type: "cognigyText",
            label: "Origin",
            defaultValue: "Web",
            params: {
                required: true
            },
        },
        {
            key: "Subject",
            type: "cognigyText",
            label: "Subject",
            defaultValue: "",
            params: {
                required: true
            },
        },
        {
            key: "Description",
            type: "cognigyText",
            label: "Description",
            defaultValue: "{{input.text}}",
            params: {
                required: true
            },
        },
        {
            key: "additionalCaseDetails",
            type: "json",
            label: "Additional Case Details",
            defaultValue: `{}`,
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
        },
        {
            key: "addionalCaseDetailsSection",
            label: "Additional Case Details",
            defaultCollapsed: true,
            fields: ["additionalCaseDetails"]
        },
    ],
    form: [
        { type: "field", key: "connectionType" },
        { type: "field", key: "basicConnection" },
        { type: "field", key: "oauthConnection" },
        { type: "field", key: "Status" },
        { type: "field", key: "Origin" },
        { type: "field", key: "Subject" },
        { type: "field", key: "Description" },
        { type: "field", key: "additionalCaseDetails" },
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
        const { Status, Origin, Subject, Description, additionalCaseDetails, connectionType, basicConnection, oauthConnection, storeLocation, contextKey, inputKey } = config;

        try {

            const salesforceConnection = await authenticate(connectionType, basicConnection, oauthConnection);

            // Single record creation
            const record = await salesforceConnection.sobject("Case").create({
                Status,
                Origin,
                Subject,
                Description,
                ...additionalCaseDetails
            });

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessCreateCase");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, record, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, record);
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