import { createExtension } from "@cognigy/extension-tools";
import { handoverToCXone } from './nodes/handover';
import { sendSignalToCXone } from './nodes/send-signal';
import { getKnowledgeHubInfo } from './nodes/knowledge-hub';
import { cxOneApiKeyData } from './connections/cxoneConnection';
import { setNiCEviewContext } from "./nodes/set-niceview-context";

export default createExtension({
	nodes: [
		handoverToCXone,
		sendSignalToCXone,
		setNiCEviewContext,
		getKnowledgeHubInfo
	],
	connections: [
		cxOneApiKeyData
	],
	options: {
		label: "CXone"
	}
});