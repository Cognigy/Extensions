import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateCustomerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        name: string;
        phone: string;
        email: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createCustomerNode = createNodeDescriptor({
    type: "createCustomer",
    defaultLabel: "Create Customer",
    summary: "Creates a new customer in stripe",
    fields: [
        {
            key: "connection",
            label: "Stripe Connection",
            type: "connection",
            params: {
                connectionType: "stripe",
                required: true
            }
        },
        {
            key: "email",
            label: "Email Address",
            type: "cognigyText",
            defaultValue: "l.wilson@cognigy.com",
            description: "The Email address of the customer",
            params: {
                required: true
            }
        },
        {
            key: "name",
            label: "Full Name",
            type: "cognigyText",
            description: "The full name of the customer",
            params: {
                required: true
            }
        },
        {
            key: "phone",
            label: "Phone Number",
            type: "cognigyText",
            description: "The phone number of the customer",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
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
            defaultValue: "context"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "stripe.customer",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.customer",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
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
        { type: "field", key: "name" },
        { type: "field", key: "phone" },
        { type: "field", key: "email" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    tokens: [
        {
            label: "Stripe Customer ID",
            script: "context.stripe.customer.id",
            type: "context"
        }
    ],
    function: async ({ cognigy, config }: ICreateCustomerParams) => {
        const { api } = cognigy;
        const { connection, name, phone, email, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const customer = await stripe.customers.create({
                name,
                email,
                phone
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, customer, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, customer);
            }

        } catch (error) {

            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }
        }
    }
});
