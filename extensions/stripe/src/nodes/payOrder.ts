import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateCardTokenParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			secretKey: string;
		};
		orderId: string;
		source: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const payOrderNode = createNodeDescriptor({
	type: "payOrder",
	defaultLabel: "Pay Order",
	summary: "Pay an order in stripe",
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
			key: "orderId",
			label: "Order ID",
			type: "cognigyText",
			defaultValue: "{{context.stripe.order.id}}",
            description: "The ID of the order that should be paid in stripe",
			params: {
				required: true
			}
		},
		{
			key: "source",
			label: "Card Token ID",
			type: "cognigyText",
			defaultValue: "{{context.stripe.token.id}}",
			description: "The token ID of the credit card that should be used in stripe",
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
		{ type: "field", key: "orderId" },
		{ type: "field", key: "source" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#556cd6"
	},
	dependencies: {
		children: [
			"onSuccessPayOrder",
			"onErrorPayOrder"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ICreateCardTokenParams) => {
		const { api } = cognigy;
		const { connection, orderId, source, storeLocation, inputKey, contextKey } = config;
		const { secretKey } = connection;

		const stripe = new Stripe(secretKey, {
			apiVersion: "2020-08-27"
		});

		try {
            const order = await stripe.orders.pay(
                orderId,
                {
                    source
                }
              );

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessPayOrder");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, order, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, order);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorPayOrder");
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

export const onSuccessPayOrder = createNodeDescriptor({
	type: "onSuccessPayOrder",
	parentType: "createCardToken",
	defaultLabel: "Paid",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onErrorPayOrder = createNodeDescriptor({
	type: "onErrorPayOrder",
	parentType: "payOrder",
	defaultLabel: "Failed",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});
