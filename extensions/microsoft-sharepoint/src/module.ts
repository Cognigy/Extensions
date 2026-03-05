import { createExtension } from "@cognigy/extension-tools";

import { getSharepointSiteInfoNode } from "./nodes/getSharepointSiteInfo";
import { cloudConnection } from "./connections/cloudConnection";
import { getSharepointListItemsNode } from "./nodes/getSharepointListItems";
import { sharepointConnector } from "./knowledge-connectors/sharepointConnector";
export default createExtension({
	nodes: [
		getSharepointSiteInfoNode,
		getSharepointListItemsNode
	],

	knowledge: [
		sharepointConnector
	],

	connections: [
		cloudConnection,
	],

	options: {
		label: "Microsoft Sharepoint"
	}
});