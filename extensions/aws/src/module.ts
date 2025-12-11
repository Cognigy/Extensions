import { createExtension } from "@cognigy/extension-tools";

import { sayPollyNode } from "./nodes/sayPolly";
import { awsConnection } from "./connections/awsConnection";
import { lambdaInvokeNode } from "./nodes/lambdaInvoke";
import { s3GetObjectNode } from "./nodes/s3GetObject";
import { s3PutObjectNode } from "./nodes/s3PutObject";
import { s3Connector } from "./knowledge-connectors/s3Connector";


export default createExtension({
	nodes: [
		// sayPollyNode,
		// lambdaInvokeNode,
		// s3GetObjectNode,
		// s3PutObjectNode
	],

	connections: [
		awsConnection
	],

	knowledge: [
		s3Connector
	],

	options: {
		label: "Amazon Web Services"
	}
});