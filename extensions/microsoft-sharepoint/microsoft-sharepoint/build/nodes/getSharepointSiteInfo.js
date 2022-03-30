"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharepointSiteInfoNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const spauth = require('node-sp-auth');
exports.getSharepointSiteInfoNode = extension_tools_1.createNodeDescriptor({
    type: "getSharepointSiteInfo",
    defaultLabel: "Get Sharepoint Site Info",
    fields: [
        {
            key: "authentication",
            label: "Select Authentication",
            type: "select",
            defaultValue: "basic",
            params: {
                required: true,
                options: [
                    {
                        label: "Cloud",
                        value: "cloud"
                    },
                    {
                        label: "Basic",
                        value: "basic"
                    }
                ],
            }
        },
        {
            key: "cloudAuth",
            label: "Sharepoint Online",
            type: "connection",
            params: {
                connectionType: "cloud",
                required: true
            },
            condition: {
                key: "authentication",
                value: "cloud",
            }
        },
        {
            key: "basicAuth",
            label: "Sharepoint Basic Auth",
            type: "connection",
            params: {
                connectionType: "basic",
                required: true
            },
            condition: {
                key: "authentication",
                value: "basic",
            }
        },
        {
            key: "url",
            label: "URL",
            description: "The Sharepiont API URL",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "sharepoint",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "sharepoint",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "connectionSection",
            label: "Authentication",
            defaultCollapsed: false,
            fields: [
                "authentication",
                "cloudAuth",
                "basicAuth",
            ]
        },
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "section", key: "connectionSection" },
        { type: "field", key: "url" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#038387"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { cloudAuth, basicAuth, authentication, url, storeLocation, inputKey, contextKey } = config;
        const { clientId, clientSecret } = cloudAuth;
        const { username, password } = basicAuth;
        let auth;
        switch (authentication) {
            case 'basic':
                auth = {
                    username,
                    password
                };
                break;
            case 'cloud':
                auth = {
                    clientId,
                    clientSecret
                };
        }
        try {
            const data = await spauth.getAuth(url, auth);
            const response = await axios_1.default({
                method: "GET",
                url: `${url}/_api/web`,
                headers: Object.assign(Object.assign({}, data.headers), { "Accept": "application/json;odata=verbose" })
            });
            if (storeLocation === "context") {
                api.addToContext(contextKey, response, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response);
            }
        }
        catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, error.message, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, error.message);
            }
        }
    }
});
//# sourceMappingURL=getSharepointSiteInfo.js.map