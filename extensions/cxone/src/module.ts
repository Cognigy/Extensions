import { createExtension } from "@cognigy/extension-tools";
import { handoverToCXone } from './nodes/handover';
import { sendSignalToCXone } from './nodes/send-signal';
import { getKnowledgeHubInfo } from './nodes/knowledge-hub';
import { cxOneApiKeyData } from './connections/cxoneConnection';

export default createExtension({
	nodes: [
		handoverToCXone,
		sendSignalToCXone,
		getKnowledgeHubInfo
	],
	connections: [
		cxOneApiKeyData
	],
	options: {
		label: "CXone"
	}
});