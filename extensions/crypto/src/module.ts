import { createExtension } from "@cognigy/extension-tools";

import * as crypto from 'crypto';
import {createHashNode} from "./nodes/createHash";
import {decryptNode} from "./nodes/decrypt";
import {encryptNode} from "./nodes/encrypt";
import {hmacNode} from "./nodes/hmac";


export default createExtension({
	nodes: [
		createHashNode,
		decryptNode,
		encryptNode,
		hmacNode
	],

	options: {
		label: "Crypto"
	}
});