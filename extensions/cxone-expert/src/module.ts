import { createExtension } from "@cognigy/extension-tools";
import { expertApiKeyData } from "./connections/expertConnection";
import { expertApiCaller } from "./nodes/api-caller";

export default createExtension({
    nodes: [expertApiCaller],
    connections: [expertApiKeyData],
    options: { label: "CXone Expert" }
});