import { createExtension } from "@cognigy/extension-tools";

import { oauthConnection } from "./connections/oauthConnection";
import { onErrorAuth, onSuccessAuth, authenticateAbbyyNode } from "./nodes/authenticate";


export default createExtension({
	nodes: [
		authenticateAbbyyNode,
		onSuccessAuth,
		onErrorAuth
	],

	connections: [
		oauthConnection
	]
});