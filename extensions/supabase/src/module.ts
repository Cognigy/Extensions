import { createExtension } from "@cognigy/extension-tools";
import { supabaseConnection } from "./connections/supabaseConnection";
import { insertNode } from "./nodes/database/insert";
import { selectNode } from "./nodes/database/select";
import { createSignedURLNode } from "./nodes/storage/createSignedURL";
import { downloadNode } from "./nodes/storage/download";
import { getPublicURLNode } from "./nodes/storage/getPublicURL";
import { listNode } from "./nodes/storage/list";
import { uploadNode } from "./nodes/storage/upload";

export default createExtension({

	connections: [
		supabaseConnection
	],

	nodes: [
		selectNode,
		insertNode,
		uploadNode,
		downloadNode,
		listNode,
		createSignedURLNode,
		getPublicURLNode
	],

	options: {
		label: "Supabase"
	}
});