import { createExtension } from "@cognigy/extension-tools";
import { matchPatternNode } from "./nodes/matchPattern";

export default createExtension({
	nodes: [
		matchPatternNode
	],

	options: {
		label: "Patterns"
	}
});