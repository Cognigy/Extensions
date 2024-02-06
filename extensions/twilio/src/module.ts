import { createExtension } from "@cognigy/extension-tools";

import { sendSMSNode } from "./nodes/sendSMS";
import { SendSMSOldNode } from "./nodes/sendSMSold";

import { twilioConnection } from "./connections/twilioConnection";


export default createExtension({
	nodes: [
		sendSMSNode,
		SendSMSOldNode
	],

	connections: [
		twilioConnection
	],

	options: {
		label: "Twilio"
	}
});