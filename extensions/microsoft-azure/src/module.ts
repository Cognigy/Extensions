import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { extractKeyphrasesNode } from "./nodes/extractKeyphrases";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";

export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		extractKeyphrasesNode,
		namedEntityRecognitionNode,
	],

	connections: [
		spellcheckConnection,
		textanalyticsConnection
	]
});