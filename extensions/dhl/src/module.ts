import { createExtension } from "@cognigy/extension-tools";
import { dhlApiKeyData } from './connections/dhlAPIKey';
import { delivered, failure, getTrackingInformationNode, pretransit, transit, unknown } from './nodes/getTrackingInformation';
import { getDHLLocationNode } from './nodes/getDHLLocation';

export default createExtension({
	nodes: [
		getTrackingInformationNode,
		pretransit,
		transit,
		delivered,
		failure,
		unknown,

		getDHLLocationNode
	],
	connections: [
		dhlApiKeyData,
	],
	options: {
		label: "DHL"
	}
});