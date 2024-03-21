import { createExtension } from "@cognigy/extension-tools";
import { run } from "./nodes/run";
import { copilotConnection } from "./connections/copilotConnection";


export default createExtension({
	nodes: [
		run
	],

	connections: [
		copilotConnection
	],

	options: {
		label: "Microsoft Copilot"
	}
});