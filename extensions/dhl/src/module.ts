import { createExtension } from "@cognigy/extension-tools";
import { dhlApiKeyData } from './connections/dhlAPIKey';
import { getTrackingInformationNode } from './nodes/getTrackingInformation';
import { getDHLLocationNode } from './nodes/getDHLLocation';

export default createExtension({
	nodes: [
		getTrackingInformationNode,
		getDHLLocationNode
	],
	connections: [
		dhlApiKeyData,
	],
	options: {
		label: "DHL"
	}
});