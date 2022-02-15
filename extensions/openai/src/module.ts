import { createExtension } from "@cognigy/extension-tools";
import { openaiConnection } from "./connections/openaiConnection";
import { generateTextNode } from "./nodes/generateText";


export default createExtension({
	nodes: [
		generateTextNode
	],

	connections: [
		openaiConnection
	],

	options: {
		label: "OpenAI"
	}
});