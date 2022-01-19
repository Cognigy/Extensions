import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateSKUParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        currency: string;
        price: number;
        inventoryType: Stripe.SkuCreateParams.Inventory.Type;
        inventoryQuantity: number;
        productId: string;
        useAttributes: boolean;
        attributes: any;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createSKUNode = createNodeDescriptor({
    type: "createSKU",
    defaultLabel: "Create SKU",
    summary: "Creates a new Stock Keeping Unit",
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
            key: "currency",
            label: "Currency",
            type: "select",
            defaultValue: "eur",
            description: "The currency that should be used",
            params: {
                required: true,
                options: [
                    {
                        label: "Euro",
                        value: "eur"
                    },
                    {
                        label: "US Dollar",
                        value: "usd"
                    }
                ]
            }
        },
        {
            key: "price",
            label: "Price",
            type: "number",
            defaultValue: "0",
            description: "The price for this new stock keeping unit",
            params: {
                required: true
            }
        },
        {
            key: "inventoryType",
            label: "Inventory Type",
            type: "select",
            defaultValue: "finite",
            params: {
                required: true,
                options: [
                    {
                        label: "Finite",
                        value: "finite"
                    },
                    {
                        label: "Bucket",
                        value: "bucket"
                    },
                    {
                        label: "Infinite",
                        value: "infinite"
                    }
                ]
            }
        },
        {
            key: "inventoryQuantity",
            label: "Inventory Quantity",
            type: "number",
            defaultValue: "1",
            description: "How many items of the product should be used",
            params: {
                required: true
            },
            condition: {
                key: "inventoryType",
                value: "finite"
            }
        },
        {
            key: "productId",
            label: "Product ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.product.id}}",
            description: "The stripe ID of the product that should be used",
            params: {
                required: true
            }
        },
        {
            key: "useAttributes",
            label: "Configure Attributes",
            type: "toggle",
            defaultValue: false,
            description: "Whether to configure attributes for the product"
        },
        {
            key: "attributes",
            label: "Attributes",
            type: "json",
            defaultValue: "{}",
            description: "Optional attributes that should be specified for the product",
            condition: {
                key: "useAttributes",
                value: true
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
            defaultValue: "stripe.sku",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.sku",
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
            key: "attributesOption",
            label: "Attributes",
            defaultCollapsed: true,
            fields: [
                "useAttributes",
                "attributes"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "currency" },
        { type: "field", key: "price" },
        { type: "field", key: "inventoryQuantity" },
        { type: "field", key: "inventoryType" },
        { type: "field", key: "productId" },
        { type: "section", key: "attributesOption" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onSuccesCreateSKU",
            "onErrorCreateSKU"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICreateSKUParams) => {
        const { api } = cognigy;
        const { connection, currency, price, inventoryQuantity, inventoryType, productId, useAttributes, attributes, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            let sku: Stripe.Response<Stripe.Sku>;

            if (useAttributes) {
                sku = await stripe.skus.create({
                    attributes,
                    price,
                    currency,
                    inventory: {
                        type: inventoryType,
                        quantity: inventoryQuantity
                    },
                    product: productId
                });
            } else {
                sku = await stripe.skus.create({
                    price,
                    currency,
                    inventory: {
                        type: inventoryType,
                        quantity: inventoryQuantity
                    },
                    product: productId
                });
            }


            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesCreateSKU");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, sku, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, sku);
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorCreateSKU");
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

export const onSuccesCreateSKU = createNodeDescriptor({
    type: "onSuccesCreateSKU",
    parentType: "createSKU",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorCreateSKU = createNodeDescriptor({
    type: "onErrorCreateSKU",
    parentType: "createSKU",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
