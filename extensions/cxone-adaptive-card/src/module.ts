import { createExtension } from "@cognigy/extension-tools";
import { adaptiveCard } from './nodes/adaptive-card';
import { captureAdaptiveCardAnswer } from './nodes/capture-adaptive-card-answer';

export default createExtension({
	nodes: [
		adaptiveCard,
		captureAdaptiveCardAnswer
	],
	connections: [],
	options: {
		label: "Adaptive Card",
	}
});