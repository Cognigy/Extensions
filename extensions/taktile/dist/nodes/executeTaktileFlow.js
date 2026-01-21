"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTaktileFlow = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = __importDefault(require("axios"));
exports.executeTaktileFlow = (0, extension_tools_1.createNodeDescriptor)({
    type: "executeTaktileFlow",
    defaultLabel: "Taktile API",
    summary: "Executes a Taktile decision flow",
    fields: [
        {
            key: "apiKeyConnection",
            label: "Taktile API Connection",
            type: "connection",
            params: {
                connectionType: "apiKey",
                required: true
            }
        },
        {
            key: "flowSlug",
            label: "Flow Slug",
            type: "cognigyText",
            defaultValue: "cognigy-test-api",
            params: { required: true }
        },
        {
            key: "customerName",
            label: "Customer Name",
            type: "cognigyText",
            params: { required: true }
        },
        {
            key: "customerDob",
            label: "Customer DOB (YYYY-MM-DD)",
            type: "cognigyText",
            params: { required: true }
        },
        {
            key: "metadata",
            label: "Metadata",
            type: "json",
            defaultValue: {
                version: "v1.1",
                entity_id: "string"
            },
            params: { required: true }
        },
        {
            key: "control",
            label: "Control",
            type: "json",
            defaultValue: {
                execution_mode: "sync"
            },
            params: { required: true }
        }
    ],
    sections: [
        {
            key: "request",
            label: "Request Configuration",
            defaultCollapsed: false,
            fields: ["flowSlug", "customerName", "customerDob"]
        },
        {
            key: "advanced",
            label: "Advanced Settings",
            defaultCollapsed: true,
            fields: ["metadata", "control"]
        }
    ],
    form: [
        { type: "field", key: "apiKeyConnection" },
        { type: "section", key: "request" },
        { type: "section", key: "advanced" }
    ],
    appearance: {
        color: "#009EDB"
    },
    function: (_a) => __awaiter(void 0, [_a], void 0, function* ({ config, cognigy }) {
        var _b, _c;
        const typedConfig = config;
        const { flowSlug, customerName, customerDob, metadata, control, apiKeyConnection } = typedConfig;
        const { api } = cognigy;
        if (!(apiKeyConnection === null || apiKeyConnection === void 0 ? void 0 : apiKeyConnection.apiKey)) {
            api.addToContext("taktileError", "API Key is required", "simple");
            return;
        }
        try {
            const response = yield axios_1.default.post(`https://eu-sandbox.azp.decide.taktile.com/run/api/v1/flows/${flowSlug}/decide`, {
                data: {
                    customer_name: customerName,
                    customer_dob: customerDob
                },
                metadata,
                control
            }, {
                headers: {
                    "accept": "application/json",
                    "X-Api-Key": apiKeyConnection.apiKey,
                    "Content-Type": "application/json"
                }
            });
            api.addToContext("taktileResponse", response.data, "simple");
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                api.addToContext("taktileError", `Taktile API Error: ${((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || error.message}`, "simple");
            }
            else {
                api.addToContext("taktileError", error.message || "Unknown error occurred", "simple");
            }
        }
    })
});
