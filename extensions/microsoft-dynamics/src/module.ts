import { createExtension } from "@cognigy/extension-tools";

import { dynamicsConnection } from "./connections/dynamicsConnection";
import { microsoftOnlineConnection } from "./connections/microsoftOnlineConnection";
import { createEntityNode } from "./nodes/createEntity";
import { getAccessTokenNode } from "./nodes/getAccessToken";
import { retrieveEntityNode } from "./nodes/retrieveEntity";
import { searchEntityNode } from "./nodes/searchEntity";


export default createExtension({
	nodes: [
		createEntityNode,
		retrieveEntityNode,
		getAccessTokenNode,
		searchEntityNode
	],

	connections: [
		dynamicsConnection,
		microsoftOnlineConnection
	]
});