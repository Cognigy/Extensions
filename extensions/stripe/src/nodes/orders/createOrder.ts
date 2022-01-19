import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateOrderParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        currency: string;
        email: string;
        itemSKUId: string;
        name: string;
        line1: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createOrderNode = createNodeDescriptor({
    type: "createOrder",
    defaultLabel: "Create Order",
    summary: "Creates a new order with a list of items and shipping address",
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
            key: "email",
            label: "Email",
            type: "cognigyText",
            defaultValue: "{{input.userId}}",
            description: "The email address of the customer",
            params: {
                required: true
            }
        },
        {
            key: "itemSKUId",
            label: "SKU ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.sku.id}}",
            description: "The ID of the created stripe stock keeping unit",
            params: {
                required: true
            }
        },
        {
            key: "name",
            label: "Name",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "line1",
            label: "Address",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "city",
            label: "City",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "country",
            label: "Country",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "postal_code",
            label: "Postal Code",
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
            defaultValue: "context"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "stripe.order",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.order",
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
            key: "shippingInformation",
            label: "Shipping",
            defaultCollapsed: false,
            fields: [
                "name",
                "line1",
                "city",
                "country",
                "postal_code"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "currency" },
        { type: "field", key: "email" },
        { type: "field", key: "itemSKUId" },
        { type: "field", key: "targetLang" },
        { type: "section", key: "shippingInformation" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onSuccesCreateOrder",
            "onErrorCreateOrder"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICreateOrderParams) => {
        const { api } = cognigy;
        const { connection, currency, email, itemSKUId, name, line1, city, state, country, postal_code, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const order: Stripe.Response<Stripe.Order> = await stripe.orders.create({
                currency,
                email,
                items: [
                  {
                      type: "sku",
                      parent: itemSKUId
                },
                ],
                shipping: {
                  name,
                  address: {
                    line1,
                    city,
                    state,
                    country,
                    postal_code
                  },
                },
              });


            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesCreateOrder");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, order, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, order);
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorCreateOrder");
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

export const onSuccesCreateOrder = createNodeDescriptor({
    type: "onSuccesCreateOrder",
    parentType: "createOrder",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorCreateOrder = createNodeDescriptor({
    type: "onErrorCreateOrder",
    parentType: "createOrder",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
