import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { authenticate } from "../authenticate";

export interface ISearchContactParams extends INodeFunctionBaseParams {
    config: {
        oauthConnection: {
            consumerKey: string;
            consumerSecret: string;
            loginUrl: string;
        };
        contactField: string;
        contactFieldValue: string;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const searchContactNode = createNodeDescriptor({
    type: "searchContact",
    defaultLabel: "Search Contact",
    fields: [
        {
            key: "oauthConnection",
            label: "Salesforce Credentials",
            type: "connection",
            params: {
                connectionType: "oauth",
                required: true
            }
        },
        {
            key: "contactField",
            type: "select",
            label: "Field",
            description: "The Contact field, such as FirstName, LastName, Email, Phone, etc. It might be called different in your Salesforce instance.",
            defaultValue: "Phone",
            params: {
                required: true,
                options: [
                    { label: "Email", value: "Email" },
                    { label: "First Name", value: "FirstName" },
                    { label: "Last Name", value: "LastName" },
                    { label: "Fax", value: "Fax" },
                    { label: "Home Phone", value: "HomePhone" },
                    { label: "Mobile Phone", value: "MobilePhone" },
                    { label: "Other Phone", value: "OtherPhone" },
                    { label: "Phone", value: "Phone" },
                ]
            },
        },
        {
            key: "contactFieldValue",
            type: "cognigyText",
            label: "Value",
            description: "The Contact field, such as FirstName, LastName, Email, Phone, etc. It might be called different in your Salesforce instance.",
            defaultValue: "{{input.userId}}",
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
            defaultValue: "salesforce.contact",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "text",
            label: "Context Key to store Result",
            defaultValue: "salesforce.contact",
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