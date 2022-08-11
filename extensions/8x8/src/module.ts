import { createExtension } from "@cognigy/extension-tools";
import { connection } from "./connections/8x8Connection";
import { crmConnection } from "./connections/8x8CRMConntection";
import { getCustomerNode } from "./nodes/crm/getCustomer";
import { handoverToEightByEightNode } from "./nodes/livechat/handover";

export default createExtension({

    nodes: [
        handoverToEightByEightNode,
        getCustomerNode
    ],

    connections: [
        connection,
        crmConnection
    ],

    options: {
        label: "8x8"
    }
});