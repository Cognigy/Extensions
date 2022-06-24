import { createExtension } from "@cognigy/extension-tools";

import { translateTextNode } from "./nodes/translateText";
import { detectLanguageInTextNode } from "./nodes/detectLanguageInText";
import { googleCloudConnection } from "./connections/googleCloudConnection";


export default createExtension({
	nodes: [
		translateTextNode,
		detectLanguageInTextNode
	],

	connections: [
		googleCloudConnection
	],

	options: {
		label: "Google Translator"
	}
});