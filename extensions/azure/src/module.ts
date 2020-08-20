import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { authenticationConnection } from "./connections/authenticationConnection";
import { bingSearchConnection } from "./connections/bingSearchConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { translatorConnection } from "./connections/translatorConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { extractKeyphrasesNode } from "./nodes/extractKeyphrases";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";
import { bingWebSearchNode } from "./nodes/bingWebSearch";
import { bingNewsSearchNode } from "./nodes/bingNewsSearch";


export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		extractKeyphrasesNode,
		namedEntityRecognitionNode,
		bingWebSearchNode,
		bingNewsSearchNode
	],

	connections: [
		spellcheckConnection,
		authenticationConnection,
		bingSearchConnection,
		textanalyticsConnection,
		translatorConnection
	]
});