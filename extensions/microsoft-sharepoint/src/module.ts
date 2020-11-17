import { createExtension } from "@cognigy/extension-tools";

import { getSharepointSiteInfoNode } from "./nodes/getSharepointSiteInfo";
import { sharepointConnection } from "./connections/sharepointConnection";
import { getSharepointListItemsNode } from "./nodes/getSharepointListItems";


export default createExtension({
	nodes: [
		getSharepointSiteInfoNode,
		getSharepointListItemsNode
	],

	connections: [
		sharepointConnection
	]
});