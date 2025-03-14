import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as crypto from 'crypto';

export interface ICreateHash extends INodeFunctionBaseParams {
	config: {
		algorithm: string;
		text: string;
		storeHash: string;
		inputKey: string;
		contextKey: string;
	};
}

export const createHashNode = createNodeDescriptor({
	type: "createHash",
	defaultLabel: "Create Hash",
	fields: [
		{
			key: "algorithm",
			label: "The hashing algorithm to use",
			type: "select",
			defaultValue: "md5",
			params: {
				required: true,
				options: [
					{
						label: "md5",
						value: "md5"
					},
					{
						label: "sha1",
						value: "sha1"
					},
					{
						label: "sha256",
						value: "sha256"
					},
					{
						label: "sha384",
						value: "sha384"
					},
					{
						label: "sha512",
						value: "sha512"
					},
					{
						label: "sha3-224",
						value: "sha3-224"
					},
					{
						label: "sha3-256",
						value: "sha3-256"
					},
					{
						label: "sha3-384",
						value: "sha3-384"
					},
					{
						label: "sha3-512",
						value: "sha3-512"
					}
				]
			}
		},
		{
			key: "text",
			label: "The text to encrypt",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "storeHash",
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
			defaultValue: "hash",
			condition: {
				key: "storeHash",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "key",
			condition: {
				key: "storeHash",
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
				"storeHash",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "algorithm" },
		{ type: "field", key: "text" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0f2b46"
	},

	function: async ({ cognigy, config}: ICreateHash) => {
		const { api } = cognigy;
		const { algorithm, text, storeHash, inputKey, contextKey } = config;
		let result = {};

		if (!text) result = Promise.reject("No text defined.");
		if (!algorithm) result = Promise.reject("No algorithm defined.");


		try {
			const hash = crypto.createHash(algorithm).update(text).digest('hex');
			result = { "result": hash };

			if (storeHash === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		} catch (error) {

			if (storeHash === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}

		}
	}
});


