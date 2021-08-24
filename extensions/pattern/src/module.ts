import { createExtension } from "@cognigy/extension-tools";
import { matchPatternNode } from "./nodes/mathPattern";

export default createExtension({
	nodes: [
		matchPatternNode
	],

	options: {
		label: "Patterns"
	}
});