import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateCardTokenParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			secretKey: string;
		};
		orderId: string;
		paymentOption: string;
		customerId: string;
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
			key: "paymentOption",
			label: "Payment Option",
			type: "select",
			defaultValue: "customer",
			description: "How to pay the order, with a customer account or a credit card",
			params: {
				required: true,
				options: [
					{
						label: "Customer Account",
						value: "customer"
					},
					{
						label: "Credit Card",
						value: "card"
					}
				]
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
			},
			condition: {
				key: "paymentOption",
				value: "card"
			}
		},
		{
			key: "customerId",
			label: "Customer ID",
			type: "cognigyText",
			defaultValue: "{{context.stripe.customer.id}}",
			description: "The token ID of the customer that should be used for the payment",
			params: {
				required: true
			},
			condition: {
				key: "paymentOption",
				value: "customer"
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
		{ type: "field", key: "paymentOption" },
		{ type: "field", key: "customerId" },
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
		const { connection, orderId, source, paymentOption, customerId, storeLocation, inputKey, contextKey } = config;
		const { secretKey } = connection;

		const stripe = new Stripe(secretKey, {
			apiVersion: "2020-08-27"
		});

		try {

			let order: Stripe.Response<Stripe.Order>;

			if (paymentOption === "customer") {
				order = await stripe.orders.pay(
					orderId,
					{
						customer: customerId
					}
				);
			} else {
				order = await stripe.orders.pay(
					orderId,
					{
						source
					}
				);
			}

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
