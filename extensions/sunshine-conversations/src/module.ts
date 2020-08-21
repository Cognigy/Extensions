import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { passControlNode } from "./nodes/passControl";
import { offerControlNode } from "./nodes/offerControl";
import { typingStartNode } from "./nodes/typingStart";
import { typingStopNode } from "./nodes/typingStop";
import { conversationReadNode } from "./nodes/conversationRead";

/* import all connections */
import { sunshineConnection } from "./connections/apiKeyConnection";

export default createExtension({

    nodes: [
        passControlNode,
        offerControlNode,
        typingStartNode,
        typingStopNode,
        conversationReadNode
    ],

    connections: [
        sunshineConnection
    ]

});