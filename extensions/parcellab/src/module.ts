import { createExtension } from "@cognigy/extension-tools";

import { getParcelInfo } from "./nodes/getParcelInfo";
import { parcellabConnection } from "./connections/parcellabConnection";

export default createExtension({
    nodes: [
        getParcelInfo,

    ],
    connections: [
        parcellabConnection
    ],

    options: {
        label: "Parcel Lab"
    }
});