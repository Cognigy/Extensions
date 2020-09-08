import { createExtension } from "@cognigy/extension-tools";
import { getEntityNode } from "./nodes/getEntity";
import { yextConnection } from "./connections/yextConnection";
import { getEntitByIdyNode } from "./nodes/getEntityById";
import { getLocationsByFiltersNode } from "./nodes/getLocationsByFilter";
import { CreateLocationNode } from "./nodes/createLocation";


export default createExtension({
	nodes: [
		getEntityNode,
		getEntitByIdyNode,
		getLocationsByFiltersNode,
		CreateLocationNode
	],
	connections: [
		yextConnection
	]
});