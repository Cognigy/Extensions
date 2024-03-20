import { createExtension } from "@cognigy/extension-tools";
import { spellCheckNode } from "./nodes/spellCheck";
import { spellcheckConnection } from "./connections/spellcheckConnection";
import { textanalyticsConnection } from "./connections/textanalyticsConnection";
import { recognizeLanguageNode } from "./nodes/recognizeLanguage";
import { namedEntityRecognitionNode } from "./nodes/namedEntityRecognition";
import { sentimentAnalysisNode } from "./nodes/sentimentAnalysis";
import { onTranscriptionError, onTranscriptionSuccess, transcribeWhatsAppVoiceMessageNode } from "./nodes/transcribeWhatsAppVoiceMessage";
import { speechServiceConnection } from "./connections/speechServiceConnection";
import { detectJailbreakNode, onJailbreakDetected, onNoJailbreakDetected } from "./nodes/content-safety/detectJailbreak";
import { contentSafetyConnetion } from "./connections/contentSafetyConnection";

export default createExtension({
	nodes: [
		spellCheckNode,
		recognizeLanguageNode,
		namedEntityRecognitionNode,
		sentimentAnalysisNode,

		transcribeWhatsAppVoiceMessageNode,
		onTranscriptionSuccess,
		onTranscriptionError,

		detectJailbreakNode,
		onJailbreakDetected,
		onNoJailbreakDetected
	],

	connections: [
		spellcheckConnection,
		textanalyticsConnection,
		speechServiceConnection,
		contentSafetyConnetion
	],

	options: {
		label: "Microsoft Azure"
	}
});