import { createExtension } from "@cognigy/extension-tools";
import { uiPatchAccessData } from './connections/uiPathAccessData';
import { uiPathInstanceData } from './connections/uiPathInstance';
import { addTransaction } from './nodes/addTransaction';
import { createTokenNode } from './nodes/createToken';
import { startJobNode } from './nodes/startJob';
import { getOutputInformationSynch } from './nodes/getOutputInformationSynch';
import { getReleasesNode } from "./nodes/getReleases";

export default createExtension({
	nodes: [
		createTokenNode,
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