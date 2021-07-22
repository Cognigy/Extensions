import { createExtension } from "@cognigy/extension-tools";
import { iCaltoJSONviaJSONNode } from "./nodes/iCaltoJSONviaJSON";
import { iCaltoJSONviaURLNode } from "./nodes/iCaltoJSONviaURL";
import { iJSONtoiCalNode } from "./nodes/JSONtoiCal";


export default createExtension({
	nodes: [
		iCaltoJSONviaJSONNode,
		iCaltoJSONviaURLNode,
		iJSONtoiCalNode
	],

	options: {
		label: "iCal Conversion"
	}
});