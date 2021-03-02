import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const {
	Aborter,
	generateBlobSASQueryParameters,
	SASProtocol,
	ContainerSASPermissions,
	ServiceURL,
	SharedKeyCredential,
	StorageURL,
	ContainerURL,
} = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');


export interface IUploadToAzureContainerParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			region: string;
			accessKeyId: string;
			secretAccessKey: string;
		};
		accountStorageName: string;
		containerName: string;
		timeout: number;
		sizeLimit: number;
	};
}
export const uploadToAzureContainerNode = createNodeDescriptor({
	type: "uploadToAzureContainer",
	defaultLabel: "Upload To Azure Container",
	fields: [
		{
			key: "connection",
			label: "Azure User Account",
			type: "connection",
			params: {
				connectionType: "azure",
				required: true
			}
		},
		{
			key: "accountStorageName",
			label: "Account Storage Name",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "containerName",
			label: "Container Name",
			type: "cognigyText",
			defaultValue: uuidv1(),
			params: {
				required: false
			}
		},
		{
			key: "timeout",
			label: "Timeout (Seconds)",
			type: "number",
			defaultValue: 5,
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
			key: "azureOptions",
			label: "Azure Options",
			defaultCollapsed: true,
			fields: [
				"containerName",
				"timeout",
				"sizeLimit"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "accountStorageName" },
		{ type: "section", key: "azureOptions" }
	],
	appearance: {
		color: "#000000"
	},
	function: async ({ cognigy, config }: IUploadToAzureContainerParams) => {
		const { api } = cognigy;
		const { connection, accountStorageName, containerName, timeout, sizeLimit } = config;
		const { secretAccessKey } = connection;

		/**Create Azure blob service object */
		function getBlobServiceUrl(): any {
			const credentials = new SharedKeyCredential(
				accountStorageName,
				secretAccessKey
			);
			const pipeline = StorageURL.newPipeline(credentials);
			const blobPrimaryURL = `https://${accountStorageName}.blob.core.windows.net/`;
			return new ServiceURL(blobPrimaryURL, pipeline);
		}

		const serviceURL = getBlobServiceUrl();


		/**Create a new container from the given name, if name was not given, the container name will be the date it was created */


		const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

		async function createContainer(): Promise<any> {
			try {

				await containerURL.create(Aborter.none);

			} catch (error) {
				return error;
			}
		}

		await createContainer();

		/**SasURL Expiration time */

		const start = new Date();
		const end = new Date();

		end.setMinutes(end.getMinutes() + timeout);

		// By default, credential is always the last element of pipeline factories
		const factories = serviceURL.pipeline.factories;
		const sharedKeyCredential = factories[factories.length - 1];

		/**Create a sasToken */

		const containerSAS = generateBlobSASQueryParameters({
			containerName, // Required
			permissions: ContainerSASPermissions.parse("racwdl").toString(), // Required
			startTime: start, // Required
			expiryTime: end, // Optional. Date type
			ipRange: { start: "0.0.0.0", end: "255.255.255.255" }, // Optional
			protocol: SASProtocol.HTTPSandHTTP, // Optional
			version: "2016-05-31" // Optional
		},
			sharedKeyCredential
		).toString();

		const baseURL = serviceURL.url;
		const sasSignature = `?${containerSAS}`;

		api.output('', {
			_plugin: {
				type: 'file-upload',
				service: 'azure',
				baseURL,
				sasSignature,
				containerName,
				sizeLimit
			}
		});
	}
});