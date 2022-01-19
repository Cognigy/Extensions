import { createExtension } from "@cognigy/extension-tools";
import { abbyyConnection } from "./connections/abbyyConnection";

import { oauthConnection } from "./connections/oauthConnection";
import { onErrorAuth, onSuccessAuth, authenticateAbbyyNode } from "./nodes/authenticate";
import { getSkillsAbbyyNode, onFoundSkills, onNotFoundSkills } from "./nodes/getSkills";
import { getTransactionNode, onNotFinishedTransaction, onProcessedTransaction } from "./nodes/getTransactionResult";
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
		onErrorTransaction,

		getTransactionNode,
		onProcessedTransaction,
		onNotFinishedTransaction
	],

	connections: [
		oauthConnection,
		abbyyConnection
	],

	options: {
		label: "Abbyy Vantage"
	}
});