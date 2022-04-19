import { createExtension } from "@cognigy/extension-tools";
import { hypatosConnection } from "./connections/hypatosConnection";
import { onErrorUpload, onSuccessUpload, uploadDocumentNode } from "./nodes/uploadDocument";



export default createExtension({
	nodes: [
		uploadDocumentNode,
		onSuccessUpload,
		onErrorUpload
	],

	connections: [
		hypatosConnection
	],

	options: {
		label: "Hypatos"
	}
});