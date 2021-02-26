import { createExtension } from "@cognigy/extension-tools";
import { loginConnection } from "./connections/loginConnection";
import { startAuthenticationNode } from "./nodes/startAuthentication";
import { getAuthenticationTokenNode } from "./nodes/getAuthenticationToken";
import { getEventsFromCalendarNode } from "./nodes/getEventsFromCalendar";
import { scheduleMeetingNode } from "./nodes/scheduleMeeting";
import { getUserDetailsNode } from "./nodes/getUserDetails";
import { sendChannelMessageNode } from "./nodes/microsoft-teams/sendChannelMessage";
import { getTodoListsNode } from "./nodes/todo/getTodoLists";
import { createTodoNode } from "./nodes/todo/createTodo";


export default createExtension({
	nodes: [
		startAuthenticationNode,
		getAuthenticationTokenNode,
		getEventsFromCalendarNode,
		scheduleMeetingNode,
		getUserDetailsNode,
		sendChannelMessageNode,
		getTodoListsNode,
		createTodoNode

	],
	connections: [
		loginConnection
	]
});