import { createExtension } from "@cognigy/extension-tools";

import { getSpreadsheetNode } from "./nodes/getSpreadsheet";
import { appendValuesNode } from "./nodes/appendValues";
import { serviceAccountConnection } from "./connections/serviceAccountConnection";


export default createExtension({
	nodes: [
		getSpreadsheetNode,
		appendValuesNode
	],

	connections: [
		serviceAccountConnection
	],

	options: {
		label: "Google Sheets"
	}
});