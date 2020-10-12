import { createExtension } from "@cognigy/extension-tools";
import { uiPathConnection } from "./connections/uiPathConnection";

import { addQueueItemsNode } from "./nodes/addQueueItem";
import { getJobsNode } from "./nodes/getJobs";
import { getQueueItemsNode } from "./nodes/getQueueItem";
import { getReleasesNode } from "./nodes/getReleases";
import { startJobNode } from "./nodes/startJob";


export default createExtension({
	nodes: [
		getReleasesNode,
		startJobNode
	],

	connections: [
		uiPathConnection
	]
});