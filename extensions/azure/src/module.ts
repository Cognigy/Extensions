import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { authenticationConnection } from "./connections/authenticationConnection";
import { bingSearchConnection } from "./connections/bingSearchConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { translatorConnection } from "./connections/translatorConnection";


export default createExtension({
	nodes: [
		spellCheckNode
	],

	connections: [
		spellcheckConnection,
		authenticationConnection,
		bingSearchConnection,
		textanalyticsConnection,
		translatorConnection
	]
});