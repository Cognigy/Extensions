import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";
import { sentimentAnalysisNode } from "./nodes/sentimentAnalysis";

export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		namedEntityRecognitionNode,
		sentimentAnalysisNode
	],

	connections: [
		spellcheckConnection,
		textanalyticsConnection
	]
});