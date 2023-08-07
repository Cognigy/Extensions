import { createExtension } from "@cognigy/extension-tools";
import { glsConnection } from "./connections/glsConnection";
import { onFoundShipment, onNotFoundShipment, trackShipmentNode } from "./nodes/trackShipment";

export default createExtension({
	nodes: [
		trackShipmentNode,
		onFoundShipment,
		onNotFoundShipment
	],

	connections: [
		glsConnection
	],

	options: {
		label: "GLS"
	}
});