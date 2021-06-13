import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetCustomerParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        email: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getCustomerNode = createNodeDescriptor({
    type: "getCustomer",
    defaultLabel: "Get Customer",
    summary: "Retrieves customer information based on a given email address",
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
        { type: "field", key: "email" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onFoundCustomer",
            "onNotFoundCustomer"
        ]
    },
    tokens: [
		{
			label: "Stripe Customer ID",
			script: "context.stripe.customer.id",
			type: "answer"
		},
		{
			label: "Stripe Customer Name",
			script: "context.stripe.customer.name",
			type: "answer"
		}
	],
    function: async ({ cognigy, config, childConfigs }: IGetCustomerParams) => {
        const { api } = cognigy;
        const { connection, email, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const customers = await stripe.customers.list(
                {
                    email
                }
            );

            if (customers.data.length === 0) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomer");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No customer found for the email ${email}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No customer found for the email ${email}`);
                }
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onFoundCustomer");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, customers.data[0], "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, customers.data[0]);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomer");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, error, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, error);
            }
        }
    }
});

export const onFoundCustomer = createNodeDescriptor({
    type: "onFoundCustomer",
    parentType: "getCustomer",
    defaultLabel: "On Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onNotFoundCustomer = createNodeDescriptor({
    type: "onNotFoundCustomer",
    parentType: "getCustomer",
    defaultLabel: "On Not Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

