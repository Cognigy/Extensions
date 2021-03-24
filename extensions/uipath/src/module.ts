import { createExtension } from "@cognigy/extension-tools";
import { uiPathAccessData } from './connections/uiPathAccessData';
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/addQueueItem';
import { cloudAuthenticationNode } from './nodes/cloudAuthentication';
import { startJobNode } from './nodes/startJob';
import { getReleasesNode } from "./nodes/getReleases";


export default createExtension({
	nodes: [
		cloudAuthenticationNode,
		addQueueItemNode,
		startJobNode,
		getReleasesNode
	],

	connections: [
		uiPathAccessData,
		uiPathOnPremAccessData,
		uiPathInstanceData,
	]
});