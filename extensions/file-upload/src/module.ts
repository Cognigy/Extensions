import { createExtension } from "@cognigy/extension-tools";

import { uploadToAWSBucketNode } from "./nodes/uploadToAWSBucket";
import { awsConnection } from "./connections/awsConnection";
import { azureConnection } from "./connections/azureConnection";
import { uploadToAzureContainerNode } from "./nodes/uploadToAzureContainer";


export default createExtension({
	nodes: [
		uploadToAWSBucketNode,
		uploadToAzureContainerNode
	],

	connections: [
		awsConnection,
		azureConnection
	]
});