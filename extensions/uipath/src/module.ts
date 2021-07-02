import { createExtension } from "@cognigy/extension-tools";
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/addQueueItem';
import { startJobNode } from './nodes/startJob';
import { getProcessesNode } from "./nodes/getProcesses";
import { getProcessByNameNode } from "./nodes/getProcessByName";
import { getRobotIdbyUserNode } from "./nodes/getRobotIdbyUser";

import { AuthenticationNode } from "./nodes/Authentication";


export default createExtension({
	nodes: [
		addQueueItemNode,
		startJobNode,
		getProcessesNode,
		AuthenticationNode,
		getProcessByNameNode,
		getRobotIdbyUserNode
	],

	connections: [
		uiPathOnPremAccessData,
		uiPathInstanceData,
	]
});