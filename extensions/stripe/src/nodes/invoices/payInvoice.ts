import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IPayInvoiceParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        invoiceId: string;
        usePaymentMethod: boolean;
        paymentMethodId: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const payInvoiceNode = createNodeDescriptor({
    type: "payInvoice",
    defaultLabel: "Pay Invoice",
    summary: "Pay a given invoice",
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
            key: "invoiceId",
            label: "Invoice ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.customer.invoices[0].id}}",
            description: "The ID of the invoice in stripe",
            params: {
                required: true
            }
        },
        {
            key: "usePaymentMethod",
            label: "Add Payment Method",
            type: "toggle",
            defaultValue: false,
            description: "Whether to add a payment method for this invoice or not",
            params: {
                required: true
            }
        },
        {
            key: "paymentMethodId",
            label: "Payment Method ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.customer.paymentMethods[0].id}}",
            description: "The ID of the payment method the user wants to use",
            params: {
                required: true
            },
            condition: {
                key: "usePaymentMethod",
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
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "stripe.payment",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.payment",
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
        { type: "field", key: "invoiceId" },
        { type: "field", key: "usePaymentMethod" },
        { type: "field", key: "paymentMethodId" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onSuccessPayInvoice",
            "onErrorPayInvoice"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IPayInvoiceParams) => {
        const { api } = cognigy;
        const { connection, invoiceId, usePaymentMethod, paymentMethodId, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            let invoice: Stripe.Response<Stripe.Invoice>;

            if (usePaymentMethod) {
                invoice = await stripe.invoices.pay(invoiceId, {
                    payment_method: paymentMethodId
                });
            } else {
                invoice = await stripe.invoices.pay(invoiceId);
            }

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessPayInvoice");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, invoice, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, invoice);
            }

        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorPayInvoice");
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

export const onSuccessPayInvoice = createNodeDescriptor({
    type: "onSuccessPayInvoice",
    parentType: "payInvoice",
    defaultLabel: "Paid",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorPayInvoice = createNodeDescriptor({
    type: "onErrorPayInvoice",
    parentType: "payInvoice",
    defaultLabel: "Failed",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});