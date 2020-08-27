import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
// Load the SDK:
import * as AWS from 'aws-sdk';


export interface IS3GetObjectParams extends INodeFunctionBaseParams {
	config: {
		connection?: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};

		bucket: string;
		key: string;
		dataFormat: string;
		// One of many optional parameters:
		// range: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const s3GetObjectNode = createNodeDescriptor({
	type: "s3GetObject",
	defaultLabel: "S3 Get Object",
	fields: [
		{
			key: "connection",
			label: "AWS Connection",
			type: "connection",
			params: {
				connectionType: "aws",
				required: false
			}
		},
		{
			key: "bucket",
			label: "S3 bucket",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "key",
			label: "S3 key",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "dataFormat",
			label: "Return Data Format",
			type: "select",
			defaultValue: "Text",
			params: {
				required: true,
				options: [
					{
						label: "Text",
						value: "text"
					},
					{
						label: "Base64",
						value: "base64"
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
			defaultValue: "s3get",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "s3get",
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
		{ type: "field", key: "bucket" },
		{ type: "field", key: "key" },
		{ type: "field", key: "dataFormat" },
		{ type: "section", key: "optionsSection" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FF9900"
	},

	function: async ({ cognigy, config }: IS3GetObjectParams) => {
		const me = "aws.s3GetObject";

		for (let p of ['bucket', 'key', 'dataFormat']) {
			if (!config[p])
				throw new Error(`${me}: Field '${p}' is missing from config.`);
		}

		const { connection, bucket, key, dataFormat, storeLocation, inputKey, contextKey } = config;

		if (key.startsWith("/") || key.startsWith("./") || key.startsWith("../")) {
			cognigy.api.log('warn', `${me}:WARNING:Object key '${key.substring(0, 10)} ...' starts with root/relative path - These are not meaningful nor recommended for S3 keys`);
		}

		// S3 CAN be accessed anonymously, so the Connection info is optional:
		if (connection) {
			// Also - S3 is region-less, so no region handling here:
			const { accessKeyId, secretAccessKey } = connection;
			// We expect user to supply BOTH, or NONE, not just one:
			if (!accessKeyId !== !secretAccessKey) throw new Error(`${me}: 'accessKeyId' and 'secretAccessKey' must be supplied together in connection data.`);
			// If both supplied, use them:
			if (accessKeyId && secretAccessKey)
				AWS.config.update({ accessKeyId, secretAccessKey });
		}

		const s3 = new AWS.S3();

		const result = await s3.getObject({ Bucket: bucket, Key: key }).promise();

		if (Buffer.isBuffer(result.Body)) {
			if (dataFormat === "text") {
				result.Body = result.Body.toString('utf8');
			} else {
				result.Body = result.Body.toString('base64');
			}
		}

		// Store the result in 0, 1 or both output keys, per user config:
		if (storeLocation === 'input' && inputKey) {
			cognigy.input[inputKey] = result;
		} else if (storeLocation === 'context' && contextKey) {
			cognigy.api.setContext(contextKey, result);
		}
	}
});