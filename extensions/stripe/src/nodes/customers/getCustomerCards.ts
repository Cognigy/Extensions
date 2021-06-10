import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetCustomerCardsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        customerId: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getCustomerCardsNode = createNodeDescriptor({
    type: "getCustomerCards",
    defaultLabel: "Get Customer Cards",
    summary: "Retrieves customer cards for payment",
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
            defaultValue: "stripe.customer.cards",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.customer.cards",
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
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onFoundCustomerCards",
            "onNotFoundCustomerCards"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetCustomerCardsParams) => {
        const { api } = cognigy;
        const { connection, customerId, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const customersCards = await stripe.customers.listSources(customerId,
                {

                    object: "card"
                }
            );

            if (customersCards.data.length === 0) {
                const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomerCards");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No cards found for the customer ${customerId}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No cards found for the customer ${customerId}`);
                }
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onFoundCustomerCards");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, customersCards.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, customersCards.data);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundCustomerCards");
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

export const onFoundCustomerCards = createNodeDescriptor({
    type: "onFoundCustomerCards",
    parentType: "getCustomerCards",
    defaultLabel: "On Cards",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onNotFoundCustomerCards = createNodeDescriptor({
    type: "onNotFoundCustomerCards",
    parentType: "getCustomerCards",
    defaultLabel: "On No Cards",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

