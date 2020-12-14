import { createExtension } from "@cognigy/extension-tools";
import { uiPatchAccessData } from './connections/uiPathAccessData';
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
		uiPatchAccessData,
		uiPathInstanceData,
	]
});