import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendApplePayParams extends INodeFunctionBaseParams {
	config: {
        attachmentId: string;
        payment_gateway_url: string;
        merchant_session: object;
        merchant_identifier: string;
        merchant_capabilities: string[];
        supported_networks: string[];
        merchant_name: string;
        country_code: string;
        currency_code: string;
        items: object[];
        total: object;
	};
}
export const sendApplePaykNode = createNodeDescriptor({
	type: "sendApplePayRingCentral",
	defaultLabel: "Send Apple Pay",
	fields: [
		{
            key: "attachmentId",
            type: "cognigyText",
            label: "Attachment ID",
            description: "The RingCentral Attachment ID for the image that should be used"
        },
        {
            key: "payment_gateway_url",
            type: "cognigyText",
            label: "Payment Gateway URL",
            params: {
                required: true
            }
        },
        {
            key: "merchant_session",
            type: "json",
            label: "Merchant Session",
            description: "The JSON payload of the merchant request",
            params: {
                required: true
            }
        },
        {
            key: "merchant_identifier",
            type: "cognigyText",
            label: "Merchant Identifier",
            params: {
                required: true
            }
        },
        {
            key: "merchant_capabilities",
            type: "textArray",
            label: "Merchant Capabilities",
            params: {
                required: true
            }
        },
        {
            key: "supported_networks",
            type: "textArray",
            label: "Supported Networks",
            params: {
                required: true
            }
        },
        {
            key: "merchant_name",
            type: "cognigyText",
            label: "Merchant Name",
            params: {
                required: true
            }
        },
        {
            key: "country_code",
            type: "cognigyText",
            label: "Country Code",
            params: {
                required: true
            }
        },
        {
            key: "currency_code",
            type: "cognigyText",
            label: "Currency Code",
            params: {
                required: true
            }
        },
        {
            key: "total",
            type: "json",
            label: "Total Price",
            description: `
[
    {
        "amount": "5.00",
        "label": "Shoes",
        "type": "final"
    }
]`,
            params: {
                required: true
            }
        },
        {
            key: "items",
            type: "json",
            label: "Items",
            description: `
[
    {
        "amount": "5.00",
        "label": "Shoes",
        "type": "final"
    }
]`,
            params: {
                required: true
            }
        }
    ],
    sections: [
        {
            key: "attachment",
            label: "Attachment",
            defaultCollapsed: true,
            fields: [
                "attachmentId"
            ]
        }
    ],
	form: [
		{ type: "field", key: "payment_gateway_url" },
        { type: "field", key: "merchant_session" },
        { type: "field", key: "merchant_identifier" },
        { type: "field", key: "merchant_capabilities" },
        { type: "field", key: "supported_networks" },
        { type: "field", key: "merchant_name" },
        { type: "field", key: "country_code" },
        { type: "field", key: "currency_code" },
        { type: "field", key: "items" },
        { type: "field", key: "total" },
        { type: "section", key: "attachment" }
	],
	appearance: {
		color: "#FF8800"
	},
	function: async ({ cognigy, config }: ISendApplePayParams) => {
		const { api } = cognigy;
		const { attachmentId, payment_gateway_url, merchant_session, merchant_identifier, merchant_capabilities, supported_networks, merchant_name, country_code, currency_code, total} = config;

        api.say('', {
			_cognigy: {
				_ringCentralEngage: {
					json: {
						command: "structured-content",
						structuredContent: {
                            type: "apple_pay",
                            attachment_id: attachmentId,
                            payment_gateway_url,
                            merchant_session,
                            merchant_identifier,
                            merchant_capabilities,
                            supported_networks,
                            merchant_name,
                            country_code,
                            currency_code,
                            total
						}
					}
				}
			}
		});
	}
});