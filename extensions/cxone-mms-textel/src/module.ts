import { createExtension } from "@cognigy/extension-tools";
import { sendTextelMms } from './nodes/send-sms';
import { textelConnectionData } from './connections/textelConnection';

export default createExtension({
	nodes: [
		sendTextelMms
	],
	connections: [
		textelConnectionData
	],
	options: {
		label: "Textel SMS/MMS",
	}
});