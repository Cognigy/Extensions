import { createExtension } from "@cognigy/extension-tools";
import { setNiCEviewContextInit } from "./nodes/initial-context";
import { setNiCEviewContextFallback } from "./nodes/fallback-context";
import { reportNiCEviewSession } from "./nodes/report-session";
import { reportNiCEviewSessionEnd } from "./nodes/report-session-end";

export default createExtension({
	nodes: [
		setNiCEviewContextInit,
		setNiCEviewContextFallback,
		reportNiCEviewSession,
		reportNiCEviewSessionEnd
	],
	connections: [
	],
	options: {
		label: "NiCEview"
	}
});