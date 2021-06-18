import { createExtension } from "@cognigy/extension-tools";
import { dhlApiKeyData } from './connections/dhlAPIKey';
import { getTrackingInformationNode } from './nodes/getTrackingInformation';



export default createExtension({
	nodes: [
		getTrackingInformationNode
	],

	connections: [
		dhlApiKeyData,
	]
});