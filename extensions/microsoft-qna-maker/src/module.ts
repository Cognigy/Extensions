import { createExtension } from "@cognigy/extension-tools";

import { qnaMakerConnection } from "./connections/qnaMakerConnection";
import { generateAnswerNode, onFoundAnswer, onNotFoundAnswer } from "./nodes/generateAnswer";

export default createExtension({
	nodes: [
		generateAnswerNode,

		onFoundAnswer,
		onNotFoundAnswer
	],

	connections: [
		qnaMakerConnection
	],

	options: {
		label: "Microsoft QnA Maker"
	}
});