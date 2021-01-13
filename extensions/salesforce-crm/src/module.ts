import { createExtension } from "@cognigy/extension-tools";

import { salesforceConnection } from "./connections/salesforce";

export default createExtension({
	nodes: [
	],

	connections: [
		salesforceConnection
	]
});