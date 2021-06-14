import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateRefundParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        chargeId: string;
        refundEntireCharge: boolean;
        amount: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createRefundNode = createNodeDescriptor({
    type: "createRefund",
    defaultLabel: "Create Refund",
    summary: "Creates a refund for a given charge in stripe",
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
            key: "chargeId",
            label: "Charge ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.customer.charges[0].id}}",
            description: "The ID of the charge that should be refunded in stripe",
            params: {
                required: true
            }
        },
        {
            key: "refundEntireCharge",
            label: "Refund Entire Charge",
            type: "toggle",
            defaultValue: true,
            description: "Whether to refund the entire price of the charge or not",
            params: {
                required: true
            }
        },
        {
            key: "amount",
            label: "Amount",
            type: "number",
            defaultValue: 0,
            description: "The price of the refund while 100 is 1 euro or dollar",
            params: {
                required: true
            },
            condition: {
                key: "refundEntireCharge",
                value: false
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
            defaultValue: "stripe.refund",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.refund",
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
        { type: "field", key: "chargeId" },
        { type: "field", key: "refundEntireCharge" },
        { type: "field", key: "amount" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onSuccessRefund",
            "onErrorRefund"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: ICreateRefundParams) => {
        const { api } = cognigy;
        const { connection, chargeId, refundEntireCharge, amount, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            let refund: Stripe.Response<Stripe.Refund>;

            if (refundEntireCharge) {
                refund = await stripe.refunds.create({
                    charge: chargeId
                });
            } else {
                refund = await stripe.refunds.create({
                    charge: chargeId,
                    amount
                });
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessRefund");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, refund, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, refund);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorRefund");
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

export const onSuccessRefund = createNodeDescriptor({
    type: "onSuccessRefund",
    parentType: "createRefund",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorRefund = createNodeDescriptor({
    type: "onErrorRefund",
    parentType: "createRefund",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});