import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { getRandomCatImage } from "./nodes/getRandomCatImage";
import { apiKeyConnection } from "./connections/apiKeyConnection";

/* import all connections */
export default createExtension({
	nodes: [
		 getRandomCatImage
	],

	connections: [
		apiKeyConnection
	]
});