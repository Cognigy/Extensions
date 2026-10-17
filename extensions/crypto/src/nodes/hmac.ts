import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as crypto from 'crypto';

export interface IHmac extends INodeFunctionBaseParams {
	config: {
		algorithm: string;
		message: string;
		secret: string;
		storeHmac: string;
		inputKey: string;
		contextKey: string;
	};
}

export const hmacNode = createNodeDescriptor({
	type: "hmac",
	defaultLabel: "HMAC",
	fields: [
		{
			key: "algorithm",
			label: "The HMAC algorithm to use",
			type: "select",
			defaultValue: "sha256",
			params: {
				required: true,
				options: [
					{
						label: "SHA256",
						value: "sha256"
					},
					{
						label: "SHA1",
						value: "sha1"
					},
					{
						label: "SHA384",
						value: "sha384"
					},
					{
						label: "SHA512",
						value: "sha512"
					},
					{
						label: "MD5",
						value: "md5"
					}
				]
			}
		},
		{
			key: "message",
			label: "The message to authenticate",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "secret",
			label: "The secret key",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "storeHmac",
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
			defaultValue: "hmac",
			condition: {
				key: "storeHmac",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "hmac",
			condition: {
				key: "storeHmac",
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
				"storeHmac",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "algorithm" },
		{ type: "field", key: "message" },
		{ type: "field", key: "secret" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0f2b46"
	},

	function: async ({ cognigy, config }: IHmac) => {
		const { api } = cognigy;
		const { algorithm, message, secret, storeHmac, inputKey, contextKey } = config;
		let result = {};

		if (!message) result = Promise.reject("No message defined.");
		if (!secret) result = Promise.reject("No secret defined.");
		if (!algorithm) result = Promise.reject("No algorithm defined.");

		try {
			const hmac = crypto.createHmac(algorithm, secret);
			hmac.update(message);
			const hash = hmac.digest('hex');
			result = { "result": hash };

			if (storeHmac === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		} catch (error) {
			if (storeHmac === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});