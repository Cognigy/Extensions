import { createExtension } from "@cognigy/extension-tools";
import { AlfrescoConnection } from "./connections/AlfrescoConnection";
import { getUserActivityNode, onFoundUserActivity, onNotFoundUserActivity } from "./nodes/getUserActivity";
import { getContentSearchNode, onFoundContentSearch, onNotFoundContentSearch } from "./nodes/getContentSearch";
import { UpdateContentNode } from "./nodes/UpdateContent";
import { CreateFolderNode } from "./nodes/CreateFolder";
import { setContentShareableNode } from "./nodes/SetContentSharable";

export default createExtension({
	nodes: [
		getContentSearchNode,
		onFoundContentSearch,
		onNotFoundContentSearch,
		setContentShareableNode,
		UpdateContentNode,
		CreateFolderNode,
		getUserActivityNode,
		onFoundUserActivity,
		onNotFoundUserActivity
	],

	connections: [
		AlfrescoConnection
	],

	options: {
		label: "Alfresco Content Respository"
	}
});