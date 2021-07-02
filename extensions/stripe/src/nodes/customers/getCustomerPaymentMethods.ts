import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetCustomerPaymentMethodsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        customerId: string;
        paymentMethod: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getCustomerPaymentMethodsNode = createNodeDescriptor({
    type: "getCustomerPaymentMethods",
    defaultLabel: "Get Payment Methods",
    summary: "Retrieves customer payment methods for payment",
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
            key: "customerId",
            label: "Customer ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.customer.id}}",
            description: "The ID of the customer in stripe",
            params: {
                required: true
            }
        },
        {
            key: "paymentMethod",
            label: "Payment Method",
            type: "select",
            defaultValue: "card",
            description: "Which payment method should be retrieved for the customer",
            params: {
                required: true,
                options: [
                    {
                        label: "Credit Card",
                        value: "card"
                    },
                    {
                        label: "Bank Account",
                        value: "bank_account"
                    }
                ]
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "stripe.customer.paymentMethods",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.customer.paymentMethods",
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
        { type: "field", key: "customerId" },
        { type: "field", key: "paymentMethod" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onFoundCustomerPaymentMethods",
            "onNotFoundCustomerPaymentMethods"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetCustomerPaymentMethodsParams) => {
        const { api } = cognigy;
        const { connection, customerId, paymentMethod, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const customersPaymentMethods = await stripe.customers.listSources(customerId,
                {

                    object: paymentMethod
                }
            );

            if (customersPaymentMethods.data.length === 0) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomerPaymentMethods");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No cards found for the customer ${customerId}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No cards found for the customer ${customerId}`);
                }
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onFoundCustomerPaymentMethods");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, customersPaymentMethods.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, customersPaymentMethods.data);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomerPaymentMethods");
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

export const onFoundCustomerPaymentMethods = createNodeDescriptor({
    type: "onFoundCustomerPaymentMethods",
    parentType: "getCustomerPaymentMethods",
    defaultLabel: "On Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onNotFoundCustomerPaymentMethods = createNodeDescriptor({
    type: "onNotFoundCustomerPaymentMethods",
    parentType: "getCustomerPaymentMethods",
    defaultLabel: "On Not Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

