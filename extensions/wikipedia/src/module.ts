import { createExtension } from "@cognigy/extension-tools";
import { onFoundArticle, onNotFoundArticle, searchArticleNode } from "./nodes/searchArticle";

export default createExtension({
	nodes: [
		searchArticleNode,
		onFoundArticle,
		onNotFoundArticle
	],

	options: {
		label: "Wikipedia"
	}
});