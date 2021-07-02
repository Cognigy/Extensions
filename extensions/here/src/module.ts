import { createExtension } from "@cognigy/extension-tools";
import { geocodeGeocoderNode } from "./nodes/geocoderGeocode";
import { hereConnection } from "./connections/hereConnection";



export default createExtension({
	nodes: [
		geocodeGeocoderNode
	],

	connections: [
		hereConnection
	]
});