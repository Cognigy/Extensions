import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetProductsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        limit: number;
        retrievePrice: boolean;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getProductsNode = createNodeDescriptor({
    type: "getProducts",
    defaultLabel: "Get Products",
    summary: "Retrieves a list of products with price in the account",
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
            key: "limit",
            label: "Limit",
            type: "number",
            defaultValue: 3,
            description: "How many products should be listed",
            params: {
                required: true
            }
        },
        {
            key: "retrievePrice",
            label: "Retrieve Prices",
            description: "Whether to get the prices for the products or not",
            type: "toggle",
            defaultValue: true,
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
            defaultValue: "stripe.products",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.products",
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
        { type: "field", key: "limit" },
        { type: "field", key: "retrievePrice" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    function: async ({ cognigy, config }: IGetProductsParams) => {
        const { api } = cognigy;
        const { connection, limit, retrievePrice, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey);


        try {

            const products = await stripe.products.list({
                limit,
            });

            if (retrievePrice) {
                for (let product of products.data) {
                    let price = await stripe.prices.list({
                        product: product.id
                    });

                    product["prices"] = price.data;
                }
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, products.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, products.data);
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
