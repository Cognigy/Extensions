import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { passControlNode } from "./nodes/passControl";
import { offerControlNode } from "./nodes/offerControl";

/* import all connections */
import { sunshineConnection } from "./connections/apiKeyConnection";

export default createExtension({

    nodes: [
        passControlNode,
        offerControlNode
    ],

    connections: [
        sunshineConnection
    ],

    options: {
        label: "Sunshine Conversations"
    }
});