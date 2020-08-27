import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
// Load the SDK
const S3 = require('aws-sdk/clients/s3');
const s3Client = new S3();

export interface IUploadToAWSBucketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};
		bucket: string;
		bucketKey: string;
		signatureVersion: string;
		sizeLimit: number;
	};
}
export const uploadToAWSBucketNode = createNodeDescriptor({
	type: "uploadToAWSBucket",
	defaultLabel: "Upload To AWS Bucket",
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
			label: "S3 Bucket Name",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "bucketKey",
			label: "S3 Bucket Key Name",
			type: "cognigyText",
			defaultValue: "uploaded-file",
			params: {
				required: false
			}
		},
		{
			key: "signatureVersion",
			label: "Signature Version",
			type: "cognigyText",
			defaultValue: "v4",
			params: {
				required: false
			}
		},
		{
			key: "sizeLimit",
			label: "File Size Limit (MB)",
			type: "number",
			defaultValue: 100,
			params: {
				required: false
			}
		},
	],
	sections: [
		{
			key: "awsOptions",
			label: "AWS S3 Options",
			defaultCollapsed: true,
			fields: [
				"bucketKey",
				"signatureVersion",
				"sizeLimit"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "bucket" },
		{ type: "section", key: "awsOptions" }
	],
	appearance: {
		color: "#000000"
	},
	function: async ({ cognigy, config }: IUploadToAWSBucketParams) => {
		const { api } = cognigy;
		const { connection, bucket, bucketKey, signatureVersion, sizeLimit } = config;
		const { region, accessKeyId, secretAccessKey } = connection;

		s3Client.config.update({
			accessKeyId,
			secretAccessKey,
			signatureVersion,
			region
		});

		const uploadUrl = s3Client.getSignedUrl('putObject', {
			Bucket: bucket,
			Key: bucketKey
		});

		const downloadUrl = s3Client.getSignedUrl('getObject', {
			Bucket: bucket,
			Key: bucketKey
		});

		api.output('', {
			_plugin: {
				type: 'file-upload',
				service: 'amazon-s3',
				uploadUrl,
				downloadUrl,
				sizeLimit
			}
		});
	}
});