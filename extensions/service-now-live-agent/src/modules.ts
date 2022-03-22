import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { serviceNowConnection } from "./connections/serviceNowConnection";

export default createExtension ({
    nodes: [
        handoverNode
    ],
    connections: [
        serviceNowConnection
    ],
    
    options: {
        label: "Service Now Live Agent"
    }
});