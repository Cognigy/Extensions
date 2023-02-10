import { createExtension } from "@cognigy/extension-tools";
import { bitlyConnection } from "./connections/bitlyConnection";
import { shortenUrlNode, onErrorShorten, onSuccessShorten } from "./nodes/shortenUrl";



export default createExtension({
	nodes: [
		shortenUrlNode,
		onSuccessShorten,
		onErrorShorten
	],

	connections: [
		bitlyConnection
	],

	options: {
		label: "Bitly"
	}
});