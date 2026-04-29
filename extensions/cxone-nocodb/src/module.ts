import { createExtension } from "@cognigy/extension-tools";
import { nocodbConnection } from "./connections/nocodbConnection.js";
import { listRecordsNode } from "./nodes/listRecords.js";
import { getRecordNode } from "./nodes/getRecord.js";
import { createRecordsNode } from "./nodes/createRecords.js";
import { updateRecordsNode } from "./nodes/updateRecords.js";
import { deleteRecordsNode } from "./nodes/deleteRecords.js";
import { listTablesNode } from "./nodes/listTables.js";

export default createExtension({
    nodes: [listRecordsNode, getRecordNode, createRecordsNode, updateRecordsNode, deleteRecordsNode, listTablesNode],
    connections: [nocodbConnection],
    options: { label: "NocoDB" }
});
