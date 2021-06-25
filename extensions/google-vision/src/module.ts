import { createExtension } from "@cognigy/extension-tools";

import { getProductNode } from "./nodes/productSearch/searchProduct";
import { googleCloudConnection } from "./connections/googleCloudConnection";


export default createExtension({
	nodes: [
		getProductNode
	],

	connections: [
		googleCloudConnection
	]
});