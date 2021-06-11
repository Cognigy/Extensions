import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Stripe from "stripe";

export interface ICreateCardTokenParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			secretKey: string;
		};
		cardNumber: string;
		exp_month: string;
		exp_year: string;
		cvc: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const createCardTokenNode = createNodeDescriptor({
	type: "createCardToken",
	defaultLabel: "Create Card Token",
	summary: "Creates a new credit card for payment",
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
			key: "cardNumber",
			label: "Card Number",
			type: "cognigyText",
			description: "The number of the credit card that should be used for the payment",
			params: {
				required: true
			}
		},
		{
			key: "exp_month",
			label: "Expiration Month",
			type: "cognigyText",
			defaultValue: "1",
			description: "The expiration month of the used credit card which needs to be provided as a number between 1 and 12",
			params: {
				required: true
			}
		},
		{
			key: "exp_year",
			label: "Expiration Year",
			type: "cognigyText",
			description: "The expiration year of the used credit card",
			defaultValue: "2024",
			params: {
				required: true,
			}
		},
		{
			key: "cvc",
			label: "CVC",
			type: "cognigyText",
			defaultValue: "132",
			description: "The CVC code of the used credit card",
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
			defaultValue: "stripe.token",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "stripe.token",
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
		{ type: "field", key: "cardNumber" },
		{ type: "field", key: "exp_month" },
		{ type: "field", key: "exp_year" },
		{ type: "field", key: "cvc" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#556cd6"
	},
	dependencies: {
		children: [
			"onSuccesCreateCardToken",
			"onErrorCreateCardToken"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ICreateCardTokenParams) => {
		const { api } = cognigy;
		const { connection, cardNumber, exp_month, exp_year, cvc, storeLocation, inputKey, contextKey } = config;
		const { secretKey } = connection;

		const stripe = new Stripe(secretKey, {
			apiVersion: "2020-08-27"
		});

		try {

			const token = await stripe.tokens.create({
				card: {
					number: cardNumber,
					exp_month,
					exp_year,
					cvc,
				},
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccesCreateCardToken");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, token, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, token);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorCreateCardToken");
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

export const onSuccesCreateCardToken = createNodeDescriptor({
	type: "onSuccesCreateCardToken",
	parentType: "createCardToken",
	defaultLabel: "On Success",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onErrorCreateCardToken = createNodeDescriptor({
	type: "onErrorCreateCardToken",
	parentType: "createCardToken",
	defaultLabel: "On Error",
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini"
	}
});
