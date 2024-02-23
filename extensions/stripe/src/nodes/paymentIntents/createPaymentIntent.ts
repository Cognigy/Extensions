import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreatePaymentIntentParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        amount: number;
        currency: string;
        automaticPaymentMethods: boolean;
        description: string;
        customer: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createPaymentIntentNode = createNodeDescriptor({
    type: "createPaymentIntent",
    defaultLabel: "Create Payment Intent",
    summary: "Creates a new payment intent in Stripe",
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
            key: "amount",
            label: "Amount",
            type: "cognigyText",
            description: "A positive integer representing how much to charge",
            params: {
                required: true
            }
        },
        {
            key: "currency",
            label: "Currency",
            type: "cognigyText",
            defaultValue: "eur",
            description: "Three-letter ISO currency code in lowercase",
            params: {
                required: true
            }
        },
        {
            key: "automaticPaymentMethods",
            label: "Automatic Payment Methods",
            type: "toggle",
            defaultValue: true,
            description: "When you enable this parameter, this PaymentIntent accepts payment methods that you enable in the Dashboard and that are compatible with this PaymentIntent's other parameters",
        },
        {
            key: "description",
            label: "Description",
            type: "cognigyText",
            description: "An arbitrary string attached to the object. Often useful for displaying to users",
        },
        {
            key: "customer",
            label: "Customer",
            type: "cognigyText",
            description: "ID of the Customer this PaymentIntent belongs to, if one exists",
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
            defaultValue: "stripe.paymentIntent",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.paymentIntent",
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
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "automaticPaymentMethods",
                "description",
                "customer"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "amount" },
        { type: "field", key: "currency" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    tokens: [
        {
            label: "Stripe Promotion Code",
            script: "input.stripe.paymentIntent.client_secret",
            type: "input"
        }
    ],
    function: async ({ cognigy, config }: ICreatePaymentIntentParams) => {
        const { api } = cognigy;
        const { connection, amount, currency, customer, automaticPaymentMethods, description, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey);

        let paymentIntentObject: Stripe.PaymentIntentCreateParams;

        // Check if customer ID is given
        if (customer) {
            paymentIntentObject = {
                amount,
                currency,
                automatic_payment_methods: {
                    enabled: automaticPaymentMethods,
                },
                description,
                customer
            }
        } else {
            paymentIntentObject = {
                amount,
                currency,
                automatic_payment_methods: {
                    enabled: automaticPaymentMethods,
                },
                description
            }
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentObject);

            if (storeLocation === "context") {
                api.addToContext(contextKey, paymentIntent, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, paymentIntent);
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
