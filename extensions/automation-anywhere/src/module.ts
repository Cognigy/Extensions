import { createExtension } from "@cognigy/extension-tools";

import { deployAutomationsNode } from "./nodes/deployAutomations";
import { automationAnywhereConnection } from "./connections/automationAnywhereConnection";
import { listAutomationsNode } from "./nodes/listAutomations";
import { listBotExecutionsNode } from "./nodes/listBotExecutions";
import { listDevicesNode } from "./nodes/listDevices";


export default createExtension({
	nodes: [
		deployAutomationsNode,
		listAutomationsNode,
		listBotExecutionsNode,
		listDevicesNode
	],

	connections: [
		automationAnywhereConnection
	]
});