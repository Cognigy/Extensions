import { createExtension } from "@cognigy/extension-tools";
import { cxoneAuthenticatedCall } from './nodes/authenticated-call';

export default createExtension({
	nodes: [
		cxoneAuthenticatedCall
	],
	connections: [],
	options: {
		label: "CXone"
	}
});