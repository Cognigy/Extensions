import { createExtension } from "@cognigy/extension-tools";
import { adaptiveCard } from './nodes/adaptive-card';

export default createExtension({
	nodes: [
		adaptiveCard
	],
	connections: [],
	options: {
		label: "NiCE Channel",
	}
});