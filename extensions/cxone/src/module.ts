import { createExtension } from "@cognigy/extension-tools";
import { handoverToCXone } from './nodes/handover';
import { sendSignalToCXone } from './nodes/send-signal';
import {
	onSuccessHandover,
	onErrorHandover,
	onSuccessSignal,
	onErrorSignal
} from './nodes/children';
import { cxOneApiKeyData } from './connections/cxoneConnection';

export default createExtension({
	nodes: [
		handoverToCXone,
		onSuccessHandover,
		onErrorHandover,
		sendSignalToCXone,
		onSuccessSignal,
		onErrorSignal
	],
	connections: [
		cxOneApiKeyData
	],
	options: {
		label: "CXone"
	}
});
