import { createExtension } from "@cognigy/extension-tools";
import { alephAlphaConnection } from "./connections/alephAlphaConnection";
import { answerNode, onFoundAnswer, onNotFoundAnswer } from "./nodes/answer";
import { summarizeNode } from "./nodes/summarize";


export default createExtension({
	nodes: [
		answerNode,
		summarizeNode,
		onFoundAnswer,
		onNotFoundAnswer
	],

	connections: [
		alephAlphaConnection
	],

	options: {
		label: "Aleph Alpha"
	}
});