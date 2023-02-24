import { createExtension } from "@cognigy/extension-tools";
import { raffleConnection } from "./connections/raffleConnection";
import { onErrorSearch, onSuccessSearch, searchNode, } from "./nodes/search";



export default createExtension({
	nodes: [
		searchNode,
		onSuccessSearch,
		onErrorSearch
	],

	connections: [
		raffleConnection
	],

	options: {
		label: "Raffle"
	}
});