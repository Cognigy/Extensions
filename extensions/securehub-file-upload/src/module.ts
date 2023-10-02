import { createExtension } from "@cognigy/extension-tools";
import { uploadToSecureHubNode } from "./nodes/uploadToSecureHub";
import { securehubConnection } from "./connections/securehubConnection";

export default createExtension({
	nodes: [
		uploadToSecureHubNode
	],

	connections: [
		securehubConnection
	],
	options: {
		label: "SecureHub File Upload"
	}
});