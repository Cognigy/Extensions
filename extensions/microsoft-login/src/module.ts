import { createExtension } from "@cognigy/extension-tools";
import { loginConnection } from "./connections/loginConnection";
import { startAuthenticationNode } from "./nodes/startAuthentication";
import { getAuthenticationTokenNode } from "./nodes/getAuthenticationToken";


export default createExtension({
	nodes: [
		startAuthenticationNode,
		getAuthenticationTokenNode
	],

	connections: [
		loginConnection
	]
});