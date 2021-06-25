import { createExtension } from "@cognigy/extension-tools";

import { searchProductNode } from "./nodes/productSearch/searchProduct";
import { googleCloudConnection } from "./connections/googleCloudConnection";
import { getProductImageNode } from "./nodes/productSearch/getProductImage";


export default createExtension({
	nodes: [
		searchProductNode,
		getProductImageNode
	],

	connections: [
		googleCloudConnection
	]
});