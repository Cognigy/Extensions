import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
// Load the SDK:
import * as AWS from 'aws-sdk';

export interface IS3PutObjectParams extends INodeFunctionBaseParams {
	config: {
		connection?: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};

		bucket: string;
		key: string;
		dataFormat: "text" | "base64";
		data: string;
		acl?: string;
		// One of many optional parameters:
		// range: string;
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const s3PutObjectNode = createNodeDescriptor({
	type: "s3PutObject",
	defaultLabel: "S3 Put Object",
	fields: [
		{
			key: "connection",
			label: "AWS Connection",
			type: "connection",
			params: {
				connectionType: "aws",
				required: true
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
			label: "Data Format",
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
			key: "data",
			label: "Data to Put",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "acl",
			label: "Access Control (ACL)",
			type: "select",
			// This is also the S3 default if unset:
			defaultValue: "bucket-owner-full-control",
			params: {
				required: true,
				options: [
					{
						label: "private",
						value: "private"
					},
					{
						label: "public-read",
						value: "public-read"
					},
					{
						label: "public-read-write",
						value: "public-read-write"
					},
					{
						label: "authenticated-",
						value: "authenticated-read"
					},
					{
						label: "aws-exec-read",
						value: "aws-exec-read"
					},
					{
						label: "bucket-owner-read",
						value: "bucket-owner-read"
					},
					{
						label: "bucket-owner-full-control",
						value: "bucket-owner-full-control"
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
			defaultValue: "s3put",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "s3put",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "optionsSection",
			label: "Options",
			defaultCollapsed: true,
			fields: [
				"acl",
			]
		},
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
		{ type: "field", key: "data" },
		{ type: "section", key: "optionsSection" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FF9900"
	},

	function: async ({ cognigy, config }: IS3PutObjectParams) => {
		const me = "aws.s3PutObject";

		// Note that requiring 'data' precludes writing an empty file... Fair enough?
		for (let p of ['connection', 'bucket', 'key', 'dataFormat', 'data']) {
			if (!config[p])
				throw new Error(`${me}: Field '${p}' is missing from config.`);
		}

		const { connection, bucket, key, dataFormat, data, acl, storeLocation, inputKey, contextKey } = config;

		if (key.startsWith("/") || key.startsWith("./") || key.startsWith("../")) {
			cognigy.api.log('warn', `${me}:WARNING:Object key '${key.substring(0, 10)} ...' starts with root/relative path - These are not meaningful nor recommended for S3 keys`);
		}

		// Also - S3 is region-less, so no region handling here:
		const { accessKeyId, secretAccessKey } = connection;
		if (!accessKeyId) throw new Error(`${me}: Field 'accessKeyId' is missing from connection config.`);
		if (!secretAccessKey) throw new Error(`${me}: Field 'secretAccessKey' is missing from connection config.`);
		AWS.config.update({ accessKeyId, secretAccessKey });

		const s3 = new AWS.S3();

		let bodyData: AWS.S3.Body;
		if (dataFormat === 'base64') {
			// If it's base64, representing binary data perhaps, we must embody as a Buffer:
			bodyData = Buffer.from(data, 'base64');
		} else {
			bodyData = data;
		}

		const params = {
			Bucket: bucket,
			Key: key,
			Body: bodyData,
			ACL: acl || undefined
		};

		const result = await s3.putObject(params).promise();

		if (storeLocation === "input" && inputKey) {
			cognigy.input[inputKey] = result;
		} else if (storeLocation === "context" && contextKey) {
			cognigy.api.setContext(contextKey, result);
		}
	}
});
