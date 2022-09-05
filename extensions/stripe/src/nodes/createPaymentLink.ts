import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreatePaymentLink extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        price: string;
        quantity: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const CreatePaymentLinkNode = createNodeDescriptor({
    type: "CreatePaymenetLink",
    defaultLabel: "Create Payment Link",
    summary: "Create a link to pay a specific product",
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
            key: "price",
            label: "Price",
            type: "cognigyText",
            description: "The Stripe price ID of the product that should be paid",
            params: {
                required: true
            }
        },
        {
            key: "quantity",
            label: "Quantity",
            description: "How many items of the product should be paid",
            type: "cognigyText",
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "stripe.paymentLink",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.paymentLink",
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
        { type: "field", key: "price" },
        { type: "field", key: "quantity" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    function: async ({ cognigy, config }: ICreatePaymentLink) => {
        const { api } = cognigy;
        const { connection, price, quantity, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price,
                        quantity,
                    },
                ],
            });

            if (storeLocation === "context") {
                api.addToContext(contextKey, paymentLink, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, paymentLink);
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
