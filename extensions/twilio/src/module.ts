import { createExtension } from "@cognigy/extension-tools";

import { sendSMSNode } from "./nodes/sendSMS";
import { twilioConnection } from "./connections/twilioConnection";


export default createExtension({
	nodes: [
		sendSMSNode
	],

	connections: [
		twilioConnection
	]
});