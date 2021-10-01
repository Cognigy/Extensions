import { createExtension } from "@cognigy/extension-tools";
import { supabaseConnection } from "./connections/supabaseConnection";
import { insertNode } from "./nodes/database/insert";
import { selectNode } from "./nodes/database/select";
import { getPublicURLNode } from "./nodes/storage/getPublicURL";
import { listNode } from "./nodes/storage/list";

export default createExtension({

	connections: [
		supabaseConnection
	],

	nodes: [
		selectNode,
		insertNode,
		listNode,
		getPublicURLNode
	],

	options: {
		label: "Supabase"
	}
});