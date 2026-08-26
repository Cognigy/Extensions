import { createExtension } from "@cognigy/extension-tools";

import { classifyIntent } from "./nodes/classifyIntent";
import { classifyIntentOpenAiKey } from "./connections/classifyIntentOpenAiKey";


export default createExtension({
	nodes: [
		classifyIntent
	],

	connections: [
		classifyIntentOpenAiKey
	],

	options: {
		label: "classifyIntent"
	}
});