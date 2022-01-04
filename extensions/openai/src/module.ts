import { createExtension } from "@cognigy/extension-tools";
import { openaiConnection } from "./connections/openaiConnection";
import { summarizeTextNode } from "./nodes/summarizeText";


export default createExtension({
	nodes: [
		summarizeTextNode
	],

	connections: [
		openaiConnection
	],

	options: {
		label: "OpenAI"
	}
});