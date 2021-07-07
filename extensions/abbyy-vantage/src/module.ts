import { createExtension } from "@cognigy/extension-tools";

import { oauthConnection } from "./connections/oauthConnection";
import { onErrorAuth, onSuccessAuth, authenticateAbbyyNode } from "./nodes/authenticate";
import { getSkillsAbbyyNode, onFoundSkills, onNotFoundSkills } from "./nodes/getSkills";
import { onErrorTransaction, onScheduledTransaction, runTransactionNode } from "./nodes/runTransaction";


export default createExtension({
	nodes: [
		authenticateAbbyyNode,
		onSuccessAuth,
		onErrorAuth,

		getSkillsAbbyyNode,
		onFoundSkills,
		onNotFoundSkills,

		runTransactionNode,
		onScheduledTransaction,
		onErrorTransaction
	],

	connections: [
		oauthConnection
	]
});