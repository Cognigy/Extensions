import { createExtension } from "@cognigy/extension-tools";
import { anthropicConnection } from "./connections/anthropicConnection";
import { promptNode } from "./nodes/Prompt";


export default createExtension({
	nodes: [
		promptNode,
	],

	connections: [
		anthropicConnection
	],

	options: {
		label: "Anthropic"
	}
});