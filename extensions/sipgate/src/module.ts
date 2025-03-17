import { createExtension } from "@cognigy/extension-tools";

import { onErrorSendSMS, onSuccessSendSMS, sendSMSNode } from "./nodes/sendSMS";
import { sipgatePersonalAccessToken } from "./connections/sipgatePersonalAccessToken";


export default createExtension({
	nodes: [
		sendSMSNode,
		onSuccessSendSMS,
		onErrorSendSMS
	],

	connections: [
		sipgatePersonalAccessToken
	],

	options: {
		label: "sipgate"
	}
});