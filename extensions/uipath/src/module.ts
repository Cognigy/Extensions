import { createExtension } from "@cognigy/extension-tools";
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addQueueItemNode } from './nodes/Orchestrator/addQueueItem';
import { startJobNode } from './nodes/Orchestrator/startJob';
import { getProcessesNode } from "./nodes/Orchestrator/getProcesses";
import { getProcessByNameNode } from "./nodes/Orchestrator/getProcessByName";
import { getRobotIdbyUserNode } from "./nodes/Orchestrator/getRobotIdbyUser";
import { getUsersNode } from "./nodes/Action Center/getUsers";
import { getTasksNode } from "./nodes/Action Center/getTasks";
import { assignTaskNode } from "./nodes/Action Center/assignTask";
import { unassignTaskNode } from "./nodes/Action Center/unassignTask";
import { reassignTaskNode } from "./nodes/Action Center/reassignTask";
import { deleteTaskNode } from "./nodes/Action Center/deleteTasks";
import { startJobSimplifiedNode } from "./nodes/Orchestrator/startJobSimplified";

import { AuthenticationNode } from "./nodes/Orchestrator/Authentication";


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
		deleteTaskNode,
		startJobSimplifiedNode
	],

	connections: [
		uiPathOnPremAccessData,
		uiPathInstanceData,
	],

	options: {
		label: "UiPath"
	}
});