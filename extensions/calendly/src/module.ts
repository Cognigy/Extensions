import { createExtension } from "@cognigy/extension-tools";
import { personalAccessTokenConnection } from "./connections/personalAccessTokenConnection";
import { getEventNode } from "./nodes/getEvent";
import { getEventInviteesNode } from "./nodes/getEventInvitees";
import { getUserNode } from "./nodes/getUser";
import { listEventsNode } from "./nodes/listEvents";

export default createExtension({
	nodes: [
		getUserNode,
		listEventsNode,
		getEventInviteesNode,
		getEventNode
	],

	connections: [
		personalAccessTokenConnection
	]
});