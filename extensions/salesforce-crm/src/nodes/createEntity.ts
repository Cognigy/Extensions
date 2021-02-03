import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface ICreateEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            loginUrl: string;
        };
        entityType: string,
        accountRecord: object;
        contactRecord: object;
        eventRecord: object;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}
export const createEntityNode = createNodeDescriptor({
    type: "createEntity",
    defaultLabel: "Create Entity",
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
            key: "entityType",
            type: "select",
            label: "Entity Type",
            defaultValue: "Contact",
            params: {
                options: [
                    {
                        label: "Account",
                        value: "Account"
                    },
                    {
                        label: "Contact",
                        value: "Contact"
                    },
                    {
                        label: "Event",
                        value: "Event"
                    }
                ],
                required: true
            },
        },
        {
            key: "accountRecord",
            type: "json",
            label: "Account Record",
            defaultValue: `{
    "Name": "Company X",
    "Phone": "0221 12345",
    "BillingCity": "Dusseldorf",
    "BillingStreet": "Speditionsstraße 1",
    "BillingState": "NRW",
    "BillingPostalCode": "40221",
    "BillingCountry": "Germany",
    "Description": "New Contact",
    "Industry": "IT",
    "Website": "www.cognigy.com"
}
            `,
            params: {
                required: true
            },
            condition: {
                key: "entityType",
                value: "Account"
            }
        },
        {
            key: "contactRecord",
            type: "json",
            label: "Contact Record",
            defaultValue: `{
    "FirstName": "Max",
    "LastName": "Mustermann"
}
            `,
            params: {
                required: true
            },
            condition: {
                key: "entityType",
                value: "Contact"
            }
        },
        {
            key: "eventRecord",
            type: "json",
            label: "Event Record",
            defaultValue: `{
    "Location": "Dusseldorf",
    "Description": "Eating Stones",
    "Subject": "Event X",
    "ActivityDate": "2019-01-25",
    "DurationInMinutes": "60",
    "ActivityDateTime": "2019-01-25T13:00:00"
}
            `,
            params: {
                required: true
            },
            condition: {
                key: "entityType",
                value: "Event"
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
            defaultValue: "salesforce.entity",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "salesforce.entity",
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
        { type: "field", key: "entityType" },
        { type: "field", key: "accountRecord" },
        { type: "field", key: "contactRecord" },
        { type: "field", key: "eventRecord" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#009EDB"
    },
    function: async ({ cognigy, config }: ICreateEntityParams) => {
        const { api } = cognigy;
        const { entityType, accountRecord, contactRecord, eventRecord, connection, storeLocation, contextKey, inputKey } = config;
        const { username, password, loginUrl } = connection;

        let entityRecord: object = {};
        switch (entityType) {
            case 'Account':
                entityRecord = accountRecord;
                break;
            case 'Contact':
                entityRecord = contactRecord;
                break;
            case 'Event':
                entityRecord = eventRecord;
                break;
        }


        try {

            const conn = new jsforce.Connection({
                loginUrl
            });

            const userInfo = await conn.login(username, password);

            // Single record creation
            const record = await conn.sobject(entityType).create(entityRecord);

            if (storeLocation === "context") {
                api.addToContext(contextKey, record, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, record);
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