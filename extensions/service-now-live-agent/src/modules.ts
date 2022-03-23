import { createExtension } from "@cognigy/extension-tools";

import { handoverNode, onError, onSuccess } from "./nodes/handover";
import { serviceNowConnection } from "./connections/serviceNowConnection";

export default createExtension ({
    nodes: [
        handoverNode,
        onSuccess,
        onError
    ],
    connections: [
        serviceNowConnection
    ],
    
    options: {
        label: "Service Now Live Agent"
    }
});