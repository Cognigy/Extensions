import { createExtension } from "@cognigy/extension-tools";
import { getIncidentNode } from "./nodes/getIncident";
import { findTicketInTextNode } from "./nodes/findTicketInText";
import { createIncidentNode } from "./nodes/createIncident";
import { getCatalogRequestNode } from "./nodes/getCatalogRequest";
import { getCatalogTaskNode } from "./nodes/getCatalogTask";
import { getServiceCatalogsNode } from "./nodes/getServiceCatalogs";
import { getServiceCatalogDetailsNode } from "./nodes/getServiceCatalogDetails";
import { snowConnection } from "./connections/snowConnection";


export default createExtension({
	nodes: [
		getIncidentNode,
		getCatalogRequestNode,
		getCatalogTaskNode,
		getServiceCatalogDetailsNode,
		getServiceCatalogsNode,
		findTicketInTextNode,
		createIncidentNode
	],

	connections: [
		snowConnection
	]
});