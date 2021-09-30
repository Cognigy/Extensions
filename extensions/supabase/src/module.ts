import { createExtension } from "@cognigy/extension-tools";
import { supabaseConnection } from "./connections/supabaseConnection";
import { insertNode } from "./nodes/database/insert";
import { selectNode } from "./nodes/database/select";
import { uploadNode } from "./nodes/storage/upload";

export default createExtension({

	connections: [
		supabaseConnection
	],

	nodes: [
		selectNode,
		insertNode,
		uploadNode
	],

	options: {
		label: "Supabase"
	}
});