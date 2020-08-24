import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { passControlToZendeskNode } from "./nodes/passControlToZendesk";
import { offerControlNode } from "./nodes/offerControl";

/* import all connections */
import { sunshineConnection } from "./connections/apiKeyConnection";

export default createExtension({

    nodes: [
        passControlToZendeskNode,
        offerControlNode
    ],

    connections: [
        sunshineConnection
    ]

});