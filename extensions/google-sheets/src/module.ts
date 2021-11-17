import { createExtension } from "@cognigy/extension-tools";

import { getSpreadsheetNode } from "./nodes/getSpreadsheet";
import { googleCloudConnection } from "./connections/googleCloudConnection";
import { appendValuesNode } from "./nodes/appendValues";


export default createExtension({
	nodes: [
		getSpreadsheetNode,
		appendValuesNode
	],

	connections: [
		googleCloudConnection
	],

	options: {
		label: "Google Sheets"
	}
});