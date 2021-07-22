import { createExtension } from "@cognigy/extension-tools";

// Import Flow Nodes
import { getIncidentNode, onErrorGetIncident, onSuccesGetIncident } from "./nodes/incident/getIncident";
import { findTicketInTextNode } from "./nodes/incident/findTicketInText";
import { createIncidentNode, onErrorCreatedIncident, onSuccesCreatedIncident } from "./nodes/incident/createIncident";
import { getCatalogRequestNode } from "./nodes/catalog/getCatalogRequest";
import { getCatalogTaskNode, onErrorGetCatalogTask, onSuccesGetCatalogTask } from "./nodes/catalog/getCatalogTask";
import { getServiceCatalogsNode } from "./nodes/catalog/getServiceCatalogs";
import { getServiceCatalogDetailsNode } from "./nodes/catalog/getServiceCatalogDetails";
import { addToServiceCatalogCartNode, onErrorAddToServiceCatalogCart, onSuccesAddToServiceCatalogCart } from "./nodes/catalog/addToServiceCatalogCart";
import { orderServiceCatalogItemNode, onSuccessServiceCatalogOrderNow, onErrorServiceCatalogOrderNow } from "./nodes/catalog/orderServiceCatalogItem";


// Import Connections
import { snowConnection } from "./connections/snowConnection";
import { getServiceCatalogItemsNode } from "./nodes/catalog/getServiceCatalogItems";
import { getArticlesNode } from "./nodes/knowledge/getArticles";


export default createExtension({
	nodes: [
		getIncidentNode,
		getCatalogRequestNode,
		getCatalogTaskNode,
		getServiceCatalogDetailsNode,
		getServiceCatalogsNode,
		findTicketInTextNode,
		createIncidentNode,
		addToServiceCatalogCartNode,
		orderServiceCatalogItemNode,
		getServiceCatalogItemsNode,
		getArticlesNode,

		onSuccesCreatedIncident,
		onErrorCreatedIncident,

		onSuccesGetIncident,
		onErrorGetIncident,

		onSuccesGetCatalogTask,
		onErrorGetCatalogTask,

		onSuccesAddToServiceCatalogCart,
		onErrorAddToServiceCatalogCart,

		onSuccessServiceCatalogOrderNow,
		onErrorServiceCatalogOrderNow
	],

	connections: [
		snowConnection
	],

	options: {
		label: "Service Now"
	}
});