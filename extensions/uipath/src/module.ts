import { createExtension } from "@cognigy/extension-tools";
import { uiPathAccessData } from './connections/uiPathAccessData';
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/addQueueItem';
import { cloudAuthenticationNode } from './nodes/cloudAuthentication';
import { startJobNode } from './nodes/startJob';
import { getQueueItemByIdNode } from './nodes/getQueueItemById';
import { getReleasesNode } from "./nodes/getReleases";
import { getQueueItemsNode } from "./nodes/getQueueItems";


export default createExtension({
	nodes: [
		cloudAuthenticationNode,
		addQueueItemNode,
		startJobNode,
		getQueueItemByIdNode,
		getReleasesNode,
		getQueueItemsNode
	],

	connections: [
		uiPathAccessData,
		uiPathOnPremAccessData,
		uiPathInstanceData,
	]
});