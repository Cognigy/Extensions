import { createExtension } from "@cognigy/extension-tools";
import { uiPathAccessData } from './connections/uiPathAccessData';
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/addQueueItem';
import { startJobNode } from './nodes/startJob';
import { getReleasesNode } from "./nodes/getReleases";
import { getReleasesByNameNode } from "./nodes/getReleasesByName";

import { AuthenticationNode } from "./nodes/Authentication";


export default createExtension({
	nodes: [
		addQueueItemNode,
		startJobNode,
		getReleasesNode,
		AuthenticationNode,
		getReleasesByNameNode
	],

	connections: [
		uiPathAccessData,
		uiPathOnPremAccessData,
		uiPathInstanceData,
	]
});