import { createExtension } from "@cognigy/extension-tools";
import { chuckNorrisJokesConnector } from "./knowledge-connectors/chuckNorrisJokesConnector";

export default createExtension({
	nodes: [],
	options: {
		label: "Chukk Norris Jokes",
	},
	knowledge: [chuckNorrisJokesConnector],
});
