import { createExtension } from "@cognigy/extension-tools";
import { getShipmentNode, onFoundShipment, onNotFoundShipment } from './nodes/getShipment';
import { parcelperformConnection } from "./connections/parcelperformConnection";

export default createExtension({
	nodes: [
		getShipmentNode,
		onFoundShipment,
		onNotFoundShipment
	],
	connections: [
		parcelperformConnection,
	],
	options: {
		label: "Parcel Perform"
	}
});