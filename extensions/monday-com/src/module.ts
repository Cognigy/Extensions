import { createExtension } from "@cognigy/extension-tools";
import { mondayConnection } from "./connections/mondayConnection";
import { getBoardsNode } from "./nodes/getBoards";
import { createItemNode } from "./nodes/createItem";


export default createExtension({
	nodes: [
		getBoardsNode,
		createItemNode
	],

	connections: [
		mondayConnection
	],

	options: {
		label: "Monday"
	}
});