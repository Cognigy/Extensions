import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";
import { sentimentAnalysisNode } from "./nodes/sentimentAnalysis";
import { transcribeWhatsAppVoiceMessageNode } from "./nodes/transcribeWhatsAppVoiceMessage";

export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		namedEntityRecognitionNode,
		sentimentAnalysisNode,
		transcribeWhatsAppVoiceMessageNode
	],

	connections: [
		spellcheckConnection,
		textanalyticsConnection
	],

	options: {
		label: "Microsoft Azure"
	}
});