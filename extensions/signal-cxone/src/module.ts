import { createExtension } from "@cognigy/extension-tools";
import { sendSignalToCXone } from './nodes/send-signal';
import { cxOneApiKeyData } from './connections/cxoneConnection';

export default createExtension({
	nodes: [
		sendSignalToCXone
	],
	connections: [
		cxOneApiKeyData
	],
	options: {
		label: "Signal CXone",
	}
});