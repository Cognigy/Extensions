import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreatePromotionCodeParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            secretKey: string;
        };
        coupon: string;
        code: string;
        active: boolean;
        assignToCustomer: boolean;
        customerId: string;
        configureMaxRedemptions: boolean;
        maxRedemptions: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createPromotionCodeNode = createNodeDescriptor({
    type: "createPromotionCode",
    defaultLabel: "Create Promotion Code",
    summary: "Creates a new promotion code in stripe",
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
            key: "coupon",
            label: "Coupon",
            type: "cognigyText",
            description: "The name of the coupon that should get the new promotion code",
            params: {
                required: true
            }
        },
        {
            key: "code",
            label: "Code",
            type: "cognigyText",
            defaultValue: "COGNIGY2021",
            description: "The actual promotion code that the person can use in the checkout",
            params: {
                required: true
            }
        },
        {
            key: "active",
            label: "Activate",
            type: "toggle",
            defaultValue: true,
            description: "Whether to activate the promotion code or not",
            params: {
                required: true
            }
        },
        {
            key: "assignToCustomer",
            label: "Assign to Customer",
            type: "toggle",
            description: "Whether to assign this promotion code to a specific customer or not",
            defaultValue: false
        },
        {
            key: "customerId",
            label: "Customer ID",
            type: "cognigyText",
            defaultValue: "{{context.stripe.customer.id}}",
            description: "The phone number of the customer",
            params: {
                required: true
            },
            condition: {
                key: "assignToCustomer",
                value: true
            }
        },
        {
            key: "configureMaxRedemptions",
            label: "Configure Max Redemptions",
            type: "toggle",
            description: "Whether to configure a maximum number of redemptions for this code or not",
            defaultValue: false
        },
        {
            key: "maxRedemptions",
            label: "Max Redemptions",
            type: "number",
            defaultValue: 1,
            description: "How often this code can be used",
            params: {
                required: true
            },
            condition: {
                key: "configureMaxRedemptions",
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
            defaultValue: "stripe.promotion",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "stripe.promotion",
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
                "active",
                "assignToCustomer",
                "customerId",
                "configureMaxRedemptions",
                "maxRedemptions"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "coupon" },
        { type: "field", key: "code" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#556cd6"
    },
    tokens: [
        {
            label: "Stripe Promotion Code",
            script: "input.stripe.promotion.code",
            type: "input"
        }
    ],
    function: async ({ cognigy, config }: ICreatePromotionCodeParams) => {
        const { api } = cognigy;
        const { connection, coupon, active, configureMaxRedemptions, maxRedemptions, code, assignToCustomer, customerId, storeLocation, inputKey, contextKey } = config;
        const { secretKey } = connection;

        const stripe = new Stripe(secretKey, {
            apiVersion: "2020-08-27"
        });

        try {

            let promotionCodeOptions: Stripe.PromotionCodeCreateParams = {
                active,
                coupon,
                code,
            };

            if (configureMaxRedemptions) {
                promotionCodeOptions["max_redemptions"] = maxRedemptions;
            }

            if (assignToCustomer) {
                promotionCodeOptions["customer"] = customerId;
            }

            const promotionCode = await stripe.promotionCodes.create(promotionCodeOptions);

            if (storeLocation === "context") {
                api.addToContext(contextKey, promotionCode, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, promotionCode);
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
