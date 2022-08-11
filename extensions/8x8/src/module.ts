import { createExtension } from "@cognigy/extension-tools";
import { connection } from "./connections/8x8Connection";
import { handoverToEightByEightNode } from "./nodes/handover";

export default createExtension({

    nodes: [
        handoverToEightByEightNode
    ],

    connections: [
        connection
    ],

    options: {
        label: "8x8"
    }
});