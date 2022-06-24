import { createExtension } from "@cognigy/extension-tools";

import { googleConnection } from "./connections/googleConnection";
import { getUserLocationFromPinnedLocationMessageNode } from "./nodes/gerUserLocationFromPinnedLocationMessage";
import { getUserLocationFromTextMessageNode } from "./nodes/getUserLocationFromTextMessage";


export default createExtension({
	nodes: [
		getUserLocationFromPinnedLocationMessageNode,
		getUserLocationFromTextMessageNode
	],

	connections: [
		googleConnection
	],

	options: {
		label: "Facebook Messenger"
	}
});