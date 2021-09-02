import { createExtension } from "@cognigy/extension-tools";

import { getSpreadsheetNode } from "./nodes/getSpreadsheet";
import { googleCloudConnection } from "./connections/googleCloudConnection";


export default createExtension({
	nodes: [
		getSpreadsheetNode
	],

	connections: [
		googleCloudConnection
	],

	options: {
		label: "Google Sheets"
	}
});