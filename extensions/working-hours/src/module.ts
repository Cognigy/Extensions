import { createExtension } from "@cognigy/extension-tools";
import { configureWorkingHoursNode, onClosed, onOpen } from "./nodes/configureWorkingHours";

export default createExtension({
	nodes: [
		configureWorkingHoursNode,
		onOpen,
		onClosed
	],
	options: {
		label: "Working Hours"
	}
});