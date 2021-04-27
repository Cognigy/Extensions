import { createExtension } from "@cognigy/extension-tools";
import { personalAccessTokenConnection } from "./connections/personalAccessTokenConnection";
import { getUserNode } from "./nodes/getUser";
import { listEventsNode } from "./nodes/listEvents";

export default createExtension({
	nodes: [
		getUserNode,
		listEventsNode
	],

	connections: [
		personalAccessTokenConnection
	]
});