import { createExtension } from "@cognigy/extension-tools";
import { connection } from "./connections/8x8Connection";
import { handoverToAgentNode } from "./nodes/handoverToAgent";

export default createExtension({

    nodes: [
        handoverToAgentNode
    ],

    connections: [
        connection
    ],

    options: {
        label: "8x8"
    }
});