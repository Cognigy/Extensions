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
import { hoursNode } from "./nodes/hours";
import { callNode } from "./nodes/call";
import { credentialConnection } from "./connections/credential";
import { avayaApiConnection } from "./connections/avayaApiConnection";
import { cpaasConnection } from "./connections/cpaasConnection";

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
        localeNode,
        hoursNode,
        callNode
    ],
    connections: [
        credentialConnection,
        avayaApiConnection,
        cpaasConnection
    ],

    options: {
        label: "Avaya Voice"
    }
});
