"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
const executeTaktileFlow_1 = require("./nodes/executeTaktileFlow");
const apiKey_1 = require("./connections/apiKey");
exports.default = (0, extension_tools_1.createExtension)({
    nodes: [
        executeTaktileFlow_1.executeTaktileFlow
    ],
    connections: [
        apiKey_1.apiKey
    ],
    options: {
        label: "Taktile"
    }
});
