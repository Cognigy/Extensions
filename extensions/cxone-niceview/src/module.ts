import { createExtension } from "@cognigy/extension-tools";
import { setNiCEviewContextInit } from "./nodes/initial-context";
import { setNiCEviewContextFallback } from "./nodes/fallback-context";

export default createExtension({
	nodes: [
		setNiCEviewContextInit,
		setNiCEviewContextFallback
	],
	connections: [
	],
	options: {
		label: "NiCEview"
	}
});