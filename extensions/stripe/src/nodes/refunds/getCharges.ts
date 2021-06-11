import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetChargesParams extends INodeFunctionBaseParams {
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

export const getChargesNode = createNodeDescriptor({
    type: "getCharges",
    defaultLabel: "Get Charges",
    summary: "Retrieves charges of a given customer in stripe",
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
            defaultValue: "stripe.customer.charges",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.customer.charges",
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
            "onChargesFound",
            "OnNoChargesFound"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetChargesParams) => {
        const { api } = cognigy;
        const { connection, customerId, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const charges = await stripe.charges.list({
                customer: customerId
            });

            if (charges.data.length === 0) {

                const onErrorChild = childConfigs.find(child => child.type === "OnNoChargesFound");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No charges found for the customer ${customerId}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No charges found for the customer ${customerId}`);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onChargesFound");
                api.setNextNode(onSuccessChild.id);
    
                if (storeLocation === "context") {
                    api.addToContext(contextKey, charges.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, charges.data);
                }
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "OnNoChargesFound");
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

export const onChargesFound = createNodeDescriptor({
    type: "onChargesFound",
    parentType: "getCharges",
    defaultLabel: "On Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const OnNoChargesFound = createNodeDescriptor({
    type: "OnNoChargesFound",
    parentType: "getCharges",
    defaultLabel: "On Not Found",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});