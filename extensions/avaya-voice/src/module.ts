import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { hangupNode } from "./nodes/hangup";
import { promptNode } from "./nodes/prompt";
import { playNode } from "./nodes/play";
import { recordNode } from "./nodes/record";
import { conferenceNode } from "./nodes/conference";
import { redirectNode } from "./nodes/redirect";
import { smsNode } from "./nodes/sms";
import { localeNode } from "./nodes/locale";
import { credentialConnection } from "./connections/credential";

export default createExtension({
    nodes: [
        handoverNode,
        hangupNode,
        promptNode,
        playNode,
        recordNode,
        conferenceNode,
        redirectNode,
        smsNode,
        localeNode
    ],
    connections: [
        credentialConnection
    ]
});
