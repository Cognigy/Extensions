import { createExtension } from "@cognigy/extension-tools";
import { executeTaktileFlow } from "./nodes/executeTaktileFlow";
import { apiKey } from "./connections/apiKey";

export default createExtension({
    nodes: [
        executeTaktileFlow
    ],
    connections: [
        apiKey
    ],
    options: {
        label: "Taktile"
    }
}); 