import { createExtension } from "@cognigy/extension-tools";
import { redactNode } from "./nodes/redact";

export default createExtension({
	nodes: [
		redactNode
	],

	options: {
		label: "Redact PII"
	}
});