"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
const getSharepointSiteInfo_1 = require("./nodes/getSharepointSiteInfo");
const cloudConnection_1 = require("./connections/cloudConnection");
const getSharepointListItems_1 = require("./nodes/getSharepointListItems");
const basicConnection_1 = require("./connections/basicConnection");
exports.default = extension_tools_1.createExtension({
    nodes: [
        getSharepointSiteInfo_1.getSharepointSiteInfoNode,
        getSharepointListItems_1.getSharepointListItemsNode
    ],
    connections: [
        cloudConnection_1.cloudConnection,
        basicConnection_1.basicConnection
    ],
    options: {
        label: "Microsoft Sharepoint"
    }
});
//# sourceMappingURL=module.js.map