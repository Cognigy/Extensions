import { createExtension } from "@cognigy/extension-tools";

import { sendSMSNode, onSuccessSendSMS, onErrorSendSMS } from "./nodes/sendSMS";
import { twilioConnection } from "./connections/twilioConnection";


export default createExtension({
	nodes: [
		sendSMSNode,
		onSuccessSendSMS,
		onErrorSendSMS
	],

	connections: [
		twilioConnection
	],

	options: {
		label: "Twilio"
	}
});
