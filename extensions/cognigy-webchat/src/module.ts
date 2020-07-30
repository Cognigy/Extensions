import { createExtension } from "@cognigy/extension-tools";

import { changeBotAvatar, resetBotAvatar, changeUserAvatar, resetUserAvatar } from "./nodes/nodes";


export default createExtension({
	nodes: [
		changeBotAvatar, resetBotAvatar, changeUserAvatar, resetUserAvatar
	],
});