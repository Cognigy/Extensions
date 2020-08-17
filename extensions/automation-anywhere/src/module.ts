import { createExtension } from "@cognigy/extension-tools";

import { deployAutomationsNode } from "./nodes/deployAutomations";
import { automationAnywhereConnection } from "./connections/automationAnywhereConnection";


export default createExtension({
	nodes: [
		deployAutomationsNode
	],

	connections: [
		automationAnywhereConnection
	]
});