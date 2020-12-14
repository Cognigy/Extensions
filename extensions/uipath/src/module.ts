import { createExtension } from "@cognigy/extension-tools";
import { uiPathAccessData } from './connections/uiPathAccessData';
import { uiPathOnPremAccessData } from './connections/uiPathOnPrem';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addTransaction } from './nodes/addTransaction';
import { cloudAuthenticationNode } from './nodes/cloudAuthentication';
import { startJobNode } from './nodes/startJob';
import { getOutputInformationSynch } from './nodes/getOutputInformationSynch';
import { getReleasesNode } from "./nodes/getReleases";
import { onPremAuthenticationNode } from "./nodes/onpremAuthentication";

export default createExtension({
	nodes: [
		cloudAuthenticationNode,
		onPremAuthenticationNode,
		addTransaction,
		startJobNode,
		getOutputInformationSynch,
		getReleasesNode
	],

	connections: [
		uiPathAccessData,
		uiPathOnPremAccessData,
		uiPathInstanceData,
	]
});