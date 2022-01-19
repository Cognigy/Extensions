import { createExtension } from "@cognigy/extension-tools";

import { onErrorSMS, onSuccessSMS, sendSMSNode } from "./nodes/sendSMS";
import { tyntecConnection } from "./connections/tyntecConnection";


export default createExtension({
	nodes: [
		sendSMSNode,
		onSuccessSMS,
		onErrorSMS
	],

	connections: [
		tyntecConnection
	],

	options: {
		label: "Tyntec"
	}
});