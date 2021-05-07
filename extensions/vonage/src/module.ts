import { createExtension } from "@cognigy/extension-tools";
import { vonageConnection } from "./connections/vonageConnection";
import { onError, onSucces, sendSMSNode } from "./nodes/sendSMS";

export default createExtension({
	nodes: [
		sendSMSNode,
		onSucces,
		onError
	],

	connections: [
		vonageConnection
	]
});