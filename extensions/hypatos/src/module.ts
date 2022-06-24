import { createExtension } from "@cognigy/extension-tools";
import { hypatosConnection } from "./connections/hypatosConnection";
import { getDocumentResultsNode, onExtracted, onProcessing } from "./nodes/getDocumentResults";
import { onErrorUpload, onSuccessUpload, uploadDocumentNode } from "./nodes/uploadDocument";



export default createExtension({
	nodes: [
		uploadDocumentNode,
		onSuccessUpload,
		onErrorUpload,

		getDocumentResultsNode,
		onProcessing,
		onExtracted
	],

	connections: [
		hypatosConnection
	],

	options: {
		label: "Hypatos"
	}
});