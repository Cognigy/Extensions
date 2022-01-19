import { createExtension } from "@cognigy/extension-tools";

import { detectLanguageNode } from "./nodes/detectLanguage";


export default createExtension({
	nodes: [
		detectLanguageNode
	],

	options: {
		label: "Language Detection"
	}
});