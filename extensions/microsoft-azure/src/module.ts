import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";
import { sentimentAnalysisNode } from "./nodes/sentimentAnalysis";
import { onTranscriptionError, onTranscriptionSuccess, transcribeWhatsAppVoiceMessageNode } from "./nodes/transcribeWhatsAppVoiceMessage";
import { speechServiceConnection } from "./connections/speechServiceConnection";

export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		namedEntityRecognitionNode,
		sentimentAnalysisNode,

		transcribeWhatsAppVoiceMessageNode,
		onTranscriptionSuccess,
		onTranscriptionError
	],

	connections: [
		spellcheckConnection,
		textanalyticsConnection,
		speechServiceConnection
	],

	options: {
		label: "Microsoft Azure"
	}
});