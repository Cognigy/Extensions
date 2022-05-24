import { createExtension } from "@cognigy/extension-tools";
import { fedexConnection } from "./connections/fedexConnection";
import { onFoundShipment, onNotFoundShipment, trackShipmentNode } from "./nodes/trackShipment";

export default createExtension({
	nodes: [
		trackShipmentNode,
		onFoundShipment,
		onNotFoundShipment
	],

	connections: [
		fedexConnection
	],

	options: {
		label: "FedEx"
	}
});