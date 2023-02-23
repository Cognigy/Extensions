import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { findContactByEmailNode } from "./nodes/findContactByEmail";
import { updateContactNode } from "./nodes/updateContact";
import { createContactNode } from "./nodes/createContact";
import { findContactNode } from "./nodes/findContact";
import { createEngagementNode } from "./nodes/createEngagement";
import { getAllCompaniesNode } from "./nodes/getAllCompanies";
import { getAllCompanyDealsNode } from "./nodes/getAllCompanyDeals";
import { getCompanyNode } from "./nodes/getCompany";
import { getContactAndOwnerNode } from "./nodes/getContactAndOwner";
import { getDealNode } from "./nodes/getDeal";

/* import all connections */
import { hubspotConnection } from "./connections/hubspot";
import { createCompanyNode } from "./nodes/createCompany";
import { updateCompanyNode } from "./nodes/updateCompany";

export default createExtension({
	nodes: [
		findContactNode,
		findContactByEmailNode,
		updateContactNode,
		createContactNode,
		createCompanyNode,
		updateCompanyNode,
		createEngagementNode,
		getAllCompaniesNode,
		getAllCompanyDealsNode,
		getCompanyNode,
		getContactAndOwnerNode,
		getDealNode
	],

	connections: [
		hubspotConnection
	],

	options: {
		label: "Hubspot"
	}
});