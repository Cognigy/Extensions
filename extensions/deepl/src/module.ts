import { createExtension } from "@cognigy/extension-tools";

import { deeplConnection } from "./connections/deeplConnection";
import { onError, onSucces, translateTextNode } from "./nodes/translateText";


export default createExtension({
	nodes: [
		translateTextNode,
		onSucces,
		onError
	],
	connections: [
		deeplConnection
	],
	options: {
		label: "DeepL"
	}
});