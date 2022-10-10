import { createExtension } from "@cognigy/extension-tools";
import { asanaPATConnection } from "./connections/asanaPATConnection";
import { getProjectsNode } from "./nodes/getProjects";
import { getTicketByIdNode, onFoundTask, onNotFoundTask } from "./nodes/getTaskById";
import { getTicketsByUserNode, onNoUserTasks, onUserTasks } from "./nodes/getTasksByUser";
import { getUsersNode } from "./nodes/getUsers";

export default createExtension({
	nodes: [
		getTicketByIdNode,
		onFoundTask,
		onNotFoundTask,

		getTicketsByUserNode,
		onUserTasks,
		onNoUserTasks,

		getUsersNode,
		getProjectsNode
	],

	connections: [
		asanaPATConnection
	],

	options: {
		label: "Asana"
	}
});