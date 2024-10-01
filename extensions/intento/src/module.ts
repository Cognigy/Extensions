import { createExtension } from "@cognigy/extension-tools";

import { translateTextNode } from "./nodes/translate";
import { langDetectNode } from "./nodes/langdetect";
import { intentoConnection } from "./connections/intentoConnection";


export default createExtension({
	nodes: [
		translateTextNode,
		langDetectNode
	],

	connections: [
		intentoConnection
	],

	options: {
		label: "Intento Translator"
	}
});