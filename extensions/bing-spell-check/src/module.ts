import { createExtension } from "@cognigy/extension-tools";
import { bingSpellCheck } from "./nodes/bingSpellCheck";
import { bingApiConnection } from "./connections/bingApiConnection";

export default createExtension({
	nodes: [	
		bingSpellCheck
	],
	connections: [
		bingApiConnection
	]
});	
