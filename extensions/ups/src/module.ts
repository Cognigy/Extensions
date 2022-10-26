import { createExtension } from "@cognigy/extension-tools";
import { upsConnection } from "./connections/upsConnection";
import { onFoundShipment, onNotFoundShipment, trackShipmentNode } from "./nodes/trackShipment";


export default createExtension({
	nodes: [
		trackShipmentNode,
		onFoundShipment,
		onNotFoundShipment

	],

	connections: [
		upsConnection
	],

	options: {
		label: "UPS"
	}
});