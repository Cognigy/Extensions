import { createExtension } from "@cognigy/extension-tools";
import { handoverToCXone } from './nodes/handover';
import { sendSignalToCXone } from './nodes/send-signal';
import { getKnowledgeHubInfo } from './nodes/knowledge-hub';
import { cxOneApiKeyData } from './connections/cxoneConnection';
import { cxoneApiCaller } from './nodes/api-caller';
import { setCxoneContextInit } from './nodes/init-context';

export default createExtension({
	nodes: [
		setCxoneContextInit,
		handoverToCXone,
		sendSignalToCXone,
		getKnowledgeHubInfo,
		cxoneApiCaller
	],
	connections: [
		cxOneApiKeyData
	],
	options: {
		label: "CXone"
	}
});