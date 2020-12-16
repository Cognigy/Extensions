import { createExtension } from "@cognigy/extension-tools";
import { getAnlage } from "./nodes/getAnlage";
import { defaultConnection} from "./connections/default";

export default createExtension({
    nodes: [
        getAnlage
    ],
    connections: [
        defaultConnection
    ]
});