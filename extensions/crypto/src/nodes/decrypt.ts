import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as crypto from 'crypto';

export interface IDecrypt extends INodeFunctionBaseParams {
	config: {
		algorithm: string;
		text: string;
		key: string;
		iv: string;
		storeDecrypt: string;
		inputKey: string;
		contextKey: string;
	};
}

export const decryptNode = createNodeDescriptor({
	type: "decrypt",
	defaultLabel: "Decrypt",
	fields: [
		{
			key: "algorithm",
			label: "Decrypts text using a given algorithm",
			type: "select",
			defaultValue: "CAST-cbc",
			params: {
				required: true,
				options: [
					{
						label: "CAST-cbc",
						value: "CAST-cbc"
					},
					{
						label: "aes-128-cbc",
						value: "aes-128-cbc"
					},
					{
						label: "aes-128-cbc-hmac-sha1",
						value: "aes-128-cbc-hmac-sha1"
					},
					{
						label: "aes-128-cfb",
						value: "aes-128-cfb"
					},
					{
						label: "aes-128-cfb1",
						value: "aes-128-cfb1"
					},
					{
						label: "aes-128-cfb8",
						value: "aes-128-cfb8"
					},
					{
						label: "aes-128-ctr",
						value: "aes-128-ctr"
					},
					{
						label: "aes-128-ecb",
						value: "aes-128-ecb"
					},
					{
						label: "aes-128-gcm",
						value: "aes-128-gcm"
					},
					{
						label: "aes-128-ofb",
						value: "aes-128-ofb"
					},
					{
						label: "aes-128-xts",
						value: "aes-128-xts"
					},
					{
						label: "aes-192-cbc",
						value: "aes-192-cbc"
					},
					{
						label: "aes-192-cfb",
						value: "aes-192-cfb"
					},
					{
						label: "aes-192-cfb1",
						value: "aes-192-cfb1"
					},
					{
						label: "aes-192-cfb8",
						value: "aes-192-cfb8"
					},
					{
						label: "aes-192-ctr",
						value: "aes-192-ctr"
					},
					{
						label: "aes-192-ecb",
						value: "aes-192-ecb"
					},
					{
						label: "aes-192-gcm",
						value: "aes-192-gcm"
					},
					{
						label: "aes-192-ofb",
						value: "aes-192-ofb"
					},
					{
						label: "aes-256-cbc",
						value: "aes-256-cbc"
					},
					{
						label: "aes-256-cbc-hmac-sha1",
						value: "aes-256-cbc-hmac-sha1"
					},
					{
						label: "aes-256-cfb",
						value: "aes-256-cfb"
					},
					{
						label: "aes-256-cfb1",
						value: "aes-256-cfb1"
					},
					{
						label: "aes-256-cfb8",
						value: "aes-256-cfb8"
					},
					{
						label: "aes-256-ctr",
						value: "aes-256-ctr"
					},
					{
						label: "aes-256-ecb",
						value: "aes-256-ecb"
					},
					{
						label: "aes-256-gcm",
						value: "aes-256-gcm"
					},
					{
						label: "aes-256-ofb",
						value: "aes-256-ofb"
					},
					{
						label: "aes-256-xts",
						value: "aes-256-xts"
					},
					{
						label: "aes128",
						value: "aes128"
					},
					{
						label: "aes192",
						value: "aes192"
					},
					{
						label: "aes256",
						value: "aes256"
					},
					{
						label: "bf",
						value: "bf"
					},
					{
						label: "bf-cbc",
						value: "bf-cbc"
					},
					{
						label: "bf-cfb",
						value: "bf-cfb"
					},
					{
						label: "bf-ecb",
						value: "bf-ecb"
					},
					{
						label: "bf-ofb",
						value: "bf-ofb"
					},
					{
						label: "blowfish",
						value: "blowfish"
					},
					{
						label: "camellia-128-cbc",
						value: "camellia-128-cbc"
					},
					{
						label: "camellia-128-cfb",
						value: "camellia-128-cfb"
					},
					{
						label: "camellia-128-cfb1",
						value: "camellia-128-cfb1"
					},
					{
						label: "camellia-128-cfb8",
						value: "camellia-128-cfb8"
					},
					{
						label: "camellia-128-ecb",
						value: "camellia-128-ecb"
					},
					{
						label: "camellia-128-ofb",
						value: "camellia-128-ofb"
					},
					{
						label: "camellia-192-cbc",
						value: "camellia-192-cbc"
					},
					{
						label: "camellia-192-cfb",
						value: "camellia-192-cfb"
					},
					{
						label: "camellia-192-cfb1",
						value: "camellia-192-cfb1"
					},
					{
						label: "camellia-192-cfb8",
						value: "camellia-192-cfb8"
					},
					{
						label: "camellia-192-ecb",
						value: "camellia-192-ecb"
					},
					{
						label: "camellia-192-ofb",
						value: "camellia-192-ofb"
					},
					{
						label: "camellia-256-cbc",
						value: "camellia-256-cbc"
					},
					{
						label: "camellia-256-cfb",
						value: "camellia-256-cfb"
					},
					{
						label: "camellia-256-cfb1",
						value: "camellia-256-cfb1"
					},
					{
						label: "camellia-256-cfb8",
						value: "camellia-256-cfb8"
					},
					{
						label: "camellia-256-ecb",
						value: "camellia-256-ecb"
					},
					{
						label: "camellia-256-ofb",
						value: "camellia-256-ofb"
					},
					{
						label: "camellia128",
						value: "camellia128"
					},
					{
						label: "camellia192",
						value: "camellia192"
					},
					{
						label: "camellia256",
						value: "camellia256"
					},
					{
						label: "cast",
						value: "cast"
					},
					{
						label: "cast-cbc",
						value: "cast-cbc"
					},
					{
						label: "cast5-cbc",
						value: "cast5-cbc"
					},
					{
						label: "cast5-cfb",
						value: "cast5-cfb"
					},
					{
						label: "cast5-ecb",
						value: "cast5-ecb"
					},
					{
						label: "cast5-ofb",
						value: "cast5-ofb"
					},
					{
						label: "des",
						value: "des"
					},
					{
						label: "des-cbc",
						value: "des-cbc"
					},
					{
						label: "des-cfb",
						value: "des-cfb"
					},
					{
						label: "des-cfb1",
						value: "des-cfb1"
					},
					{
						label: "des-cfb8",
						value: "des-cfb8"
					},
					{
						label: "des-ecb",
						value: "des-ecb"
					},
					{
						label: "des-ede",
						value: "des-ede"
					},
					{
						label: "des-ede-cbc",
						value: "des-ede-cbc"
					},
					{
						label: "des-ede-cfb",
						value: "des-ede-cfb"
					},
					{
						label: "des-ede-ofb",
						value: "des-ede-ofb"
					},
					{
						label: "des-ede3",
						value: "des-ede3"
					},
					{
						label: "des-ede3-cbc",
						value: "des-ede3-cbc"
					},
					{
						label: "des-ede3-cfb",
						value: "des-ede3-cfb"
					},
					{
						label: "des-ede3-cfb1",
						value: "des-ede3-cfb1"
					},
					{
						label: "des-ede3-cfb8",
						value: "des-ede3-cfb8"
					},
					{
						label: "des-ede3-ofb",
						value: "des-ede3-ofb"
					},
					{
						label: "des-ofb",
						value: "des-ofb"
					},
					{
						label: "des3",
						value: "des3"
					},
					{
						label: "desx",
						value: "desx"
					},
					{
						label: "desx-cbc",
						value: "desx-cbc"
					},
					{
						label: "id-aes128-GCM",
						value: "id-aes128-GCM"
					},
					{
						label: "id-aes192-GCM",
						value: "id-aes192-GCM"
					},
					{
						label: "id-aes256-GCM",
						value: "id-aes256-GCM"
					},
					{
						label: "idea",
						value: "idea"
					},
					{
						label: "idea-cbc",
						value: "idea-cbc"
					},
					{
						label: "idea-cfb",
						value: "idea-cfb"
					},
					{
						label: "idea-ecb",
						value: "idea-ecb"
					},
					{
						label: "idea-ofb",
						value: "idea-ofb"
					},
					{
						label: "rc2",
						value: "rc2"
					},
					{
						label: "rc2-40-cbc",
						value: "rc2-40-cbc"
					},
					{
						label: "rc2-64-cbc",
						value: "rc2-64-cbc"
					},
					{
						label: "rc2-cbc",
						value: "rc2-cbc"
					},
					{
						label: "rc2-cfb",
						value: "rc2-cfb"
					},
					{
						label: "rc2-ecb",
						value: "rc2-ecb"
					},
					{
						label: "rc2-ofb",
						value: "rc2-ofb"
					},
					{
						label: "rc4",
						value: "rc4"
					},
					{
						label: "rc4-40",
						value: "rc4-40"
					},
					{
						label: "rc4-hmac-md5",
						value: "rc4-hmac-md5"
					},
					{
						label: "seed",
						value: "seed"
					},
					{
						label: "seed-cbc",
						value: "seed-cbc"
					},
					{
						label: "seed-cfb",
						value: "seed-cfb"
					},
					{
						label: "seed-ecb",
						value: "seed-ecb"
					},
					{
						label: "seed-ofb",
						value: "seed-ofb"
					}
				]
			}
		},
		{
			key: "text",
			label: "The text to decrypt",
			type: "cognigyText",
			defaultValue: "{{context.encrypt.result}}",
			params: {
				required: true
			}
		},
		{
			key: "key",
			label: "The key to use",
			type: "cognigyText",
			defaultValue: "{{context.key.result}}",
			params: {
				required: true
			}
		},
		{
			key: "iv",
			label: "Initialization Vector (IV)",
			type: "cognigyText",
			defaultValue: "{{context.iv.result}}",
			params: {
				required: true
			}
		},
		{
			key: "storeDecrypt",
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
			defaultValue: "decrypt",
			condition: {
				key: "storeDecrypt",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "decrypt",
			condition: {
				key: "storeDecrypt",
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
				"storeDecrypt",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "algorithm" },
		{ type: "field", key: "text" },
		{ type: "field", key: "key" },
		{ type: "field", key: "iv" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0f2b46"
	},

	function: async ({ cognigy, config }: IDecrypt) => {
		const { api } = cognigy;
		const { algorithm, text, key, iv, storeDecrypt, inputKey, contextKey } = config;
		let result = {};

		if (!text) result = Promise.reject("No text defined.");
		if (!key) result = Promise.reject("No key defined.");
		if (!iv) result = Promise.reject("No initialization vector defined.");
		if (!algorithm) result = Promise.reject("No algorithm defined.");

		try {
			// Prepare key and iv with correct lengths
			const keyBuffer = Buffer.from(key);
			const ivBuffer = Buffer.from(iv, 'utf8');
			const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
			let decrypted = decipher.update(text, 'hex', 'utf8');
			decrypted += decipher.final('utf8');
			result = { "result": decrypted };

			if (storeDecrypt === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		} catch (error) {

			if (storeDecrypt === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});


