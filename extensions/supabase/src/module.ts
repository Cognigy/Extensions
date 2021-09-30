import { createExtension } from "@cognigy/extension-tools";
import { supabaseConnection } from "./connections/supabaseConnection";
import { insertNode } from "./nodes/insert";
import { selectNode } from "./nodes/select";

export default createExtension({

	connections: [
		supabaseConnection
	],

	nodes: [
		selectNode,
		insertNode
	],

	options: {
		label: "Supabase"
	}
});