import { createExtension } from "@cognigy/extension-tools";
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/addQueueItem';
import { startJobNode } from './nodes/startJob';
import { getProcessesNode } from "./nodes/getProcesses";
import { getProcessByNameNode } from "./nodes/getProcessByName";
import { getRobotIdbyUserNode } from "./nodes/getRobotIdbyUser";
import { getUsersNode } from "./nodes/getUsers";
import { getTasksNode } from "./nodes/getTasks";
import { assignTaskNode } from "./nodes/assignTask";
import { unassignTaskNode } from "./nodes/unassignTask";
import { reassignTaskNode } from "./nodes/reassignTask";
import { deleteTaskNode } from "./nodes/deleteTasks";

import { AuthenticationNode } from "./nodes/Authentication";


export default createExtension({
	nodes: [
		addQueueItemNode,
		startJobNode,
		getProcessesNode,
		AuthenticationNode,
		getProcessByNameNode,
		getRobotIdbyUserNode,
		getUsersNode,
		getTasksNode,
		assignTaskNode,
		unassignTaskNode,
		reassignTaskNode,
		deleteTaskNode
	],

	connections: [
		uiPathOnPremAccessData,
		uiPathInstanceData,
	],

	options: {
		label: "UiPath Orchestrator"
	}
});