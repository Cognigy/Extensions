import { createExtension } from "@cognigy/extension-tools";
import { vonageConnection } from "./connections/vonageConnection";
import { checkVerifyPinNode, onInvalid, onValid } from "./nodes/checkVerifyPin";
import { onError, onSucces, sendSMSNode } from "./nodes/sendSMS";
import { sendVerifyPinNode } from "./nodes/sendVerifyPin";

export default createExtension({
	nodes: [
		sendSMSNode,
		onSucces,
		onError,
		sendVerifyPinNode,
		checkVerifyPinNode,
		onValid,
		onInvalid
	],

	connections: [
		vonageConnection
	]
});