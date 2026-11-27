import { createExtension } from "@cognigy/extension-tools";

import { getSharepointSiteInfoNode } from "./nodes/getSharepointSiteInfo";
import { cloudConnection } from "./connections/cloudConnection";
import { getSharepointListItemsNode } from "./nodes/getSharepointListItems";
import { basicConnection } from "./connections/basicConnection";
import { connectorConnection } from "./connections/connectorConnection";
import { sharepointConnector } from "./knowledge-connectors/sharepoint-connector";
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
		basicConnection,
		connectorConnection
	],

	options: {
		label: "Microsoft Sharepoint"
	}
});