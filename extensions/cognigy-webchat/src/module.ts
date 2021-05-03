import { createExtension } from "@cognigy/extension-tools";

import { changeBotAvatar } from "./nodes/changeBotAvatar";
import { resetBotAvatar } from "./nodes/resetBotAvatar";
import { changeUserAvatar } from "./nodes/changeUserAvatar";
import { resetUserAvatar } from "./nodes/resetUserAvatar";
import { changeAgentAvatar } from "./nodes/changeAgentAvatar";
import { resetAgentAvatar } from "./nodes/resetAgentAvatar";


export default createExtension({
	nodes: [
		changeBotAvatar,
		resetBotAvatar,
		changeUserAvatar,
		resetUserAvatar,
		changeAgentAvatar,
		resetAgentAvatar
	],
});