import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface IGetInvoicesParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        customerId: string;
        status: Stripe.InvoiceListParams.Status;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getCustomerInvoicesNode = createNodeDescriptor({
    type: "getCustomerInvoices",
    defaultLabel: "Get Invoices",
    summary: "Retrieves invoices of a given customer in stripe",
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
            key: "status",
            label: "Status",
            type: "select",
            defaultValue: "open",
            description: "Which type of invoices should be retrieved",
            params: {
                required: true,
                options: [
                    {
                        label: "Open",
                        value: "open"
                    },
                    {
                        label: "Paid",
                        value: "paid"
                    },
                    {
                        label: "Draft",
                        value: "draft"
                    },
                    {
                        label: "Void",
                        value: "void"
                    },
                    {
                        label: "Uncollectible",
                        value: "uncollectible"
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
            defaultValue: "stripe.customer.invoices",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.customer.invoices",
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
        { type: "field", key: "status" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    dependencies: {
        children: [
            "onFoundInvoices",
            "OnNotFoundInvoices"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IGetInvoicesParams) => {
        const { api } = cognigy;
        const { connection, customerId, status, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            const invoices = await stripe.invoices.list({
                customer: customerId,
                status
            });

            if (invoices.data.length === 0) {

                const onErrorChild = childConfigs.find(child => child.type === "OnNotFoundInvoices");
                api.setNextNode(onErrorChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, `No invoices found for the customer ${customerId}`, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, `No invoices found for the customer ${customerId}`);
                }
            } else {
                const onSuccessChild = childConfigs.find(child => child.type === "onFoundInvoices");
                api.setNextNode(onSuccessChild.id);

                if (storeLocation === "context") {
                    api.addToContext(contextKey, invoices.data, "simple");
                } else {
                    // @ts-ignore
                    api.addToInput(inputKey, invoices.data);
                }
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "OnNotFoundInvoices");
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

export const onFoundInvoices = createNodeDescriptor({
    type: "onFoundInvoices",
    parentType: "getCustomerInvoices",
    defaultLabel: "On Invoices",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const OnNotFoundInvoices = createNodeDescriptor({
    type: "OnNotFoundInvoices",
    parentType: "getCustomerInvoices",
    defaultLabel: "On No Invoices",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});