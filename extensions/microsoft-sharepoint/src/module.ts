import { createExtension } from "@cognigy/extension-tools";

import { getSharepointSiteInfoNode } from "./nodes/getSharepointSiteInfo";
import { cloudConnection } from "./connections/cloudConnection";
import { getSharepointListItemsNode } from "./nodes/getSharepointListItems";
import { basicConnection } from "./connections/basicConnection";


export default createExtension({
	nodes: [
		getSharepointSiteInfoNode,
		getSharepointListItemsNode
	],

	connections: [
		cloudConnection,
		basicConnection
	],

	options: {
		label: "Microsoft Sharepoint"
	}
});