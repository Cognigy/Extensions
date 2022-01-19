import { createExtension } from "@cognigy/extension-tools";

import { getCharacterNode } from "./nodes/GetCharacter";
import { getListOfCharactersNode } from "./nodes/getListOfCharacters";
import { getCreatorNode } from "./nodes/getCreator";
import { getSeriesByCreatorIDNode } from "./nodes/getSeriesByCreatorID";
import { getComicByUPCNode } from "./nodes/getComicByUPC";
import { getComicByNameIssueNode } from "./nodes/getComicByNameIssue";
import { getComicByComicIDNode } from "./nodes/getComicByComicID";
import { marvelAPIKeys } from "./connections/MarvelAPIKeys";



export default createExtension({
	nodes: [
		getCharacterNode,
		getSeriesByCreatorIDNode,
		getListOfCharactersNode,
		getCreatorNode,
		getComicByUPCNode,
		getComicByNameIssueNode,
		getComicByComicIDNode
	],
	connections: [
		marvelAPIKeys
	],

	options: {
		label: "Marvel"
	}
});