import { createExtension } from "@cognigy/extension-tools";
import { kofaxRobotConnection } from "./connections/kofaxRobotConnection";
import { runRobotNode } from "./nodes/runRobot";



export default createExtension({
	nodes: [
		runRobotNode
	],

	connections: [
		kofaxRobotConnection
	],

	options: {
		label: "Kofax"
	}
});