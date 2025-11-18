import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import transformConversation from '../helpers/tms-payload';
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignalHandover, postToTMS } from "../helpers/cxone-utils";

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string;
        action: string;
        contactId: string;
        spawnedContactId: string;
        businessNumber: string;
        transferIntent: string;
        optionalParamsMode: string;
        optionalParamsObject: any;
        optionalParamsArray: any;
        optionalParams: any;
        connection: {
            accessKeyId: string;
            accessKeySecret: string;
            clientId: string;
            clientSecret: string;
        };
    };
}

export const handoverToCXone = createNodeDescriptor({
    type: "handoverToCXone",
    defaultLabel: "Exit Interaction",
    summary: "Return control to CXone. Send transcript to TMS.",
    preview: {
        key: "action",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "CXone Connection",
            type: "connection",
            description: "Select the CXone connection to use, or create one.",
            params: {
                connectionType: "cxoneConnection",
                required: true
            }
        },
        {
            key: "environment",
            label: "Environment",
            type: "select",
            description: "The CXone environment.",
            defaultValue: "https://cxone.niceincontact.com",
            params: {
                options: [
                    { label: "Global Production", value: "https://cxone.niceincontact.com" },
                    { label: "FedRAMP Moderate", value: "https://cxone-gov.niceincontact.com" },
                    { label: "Australian Sovereign", value: "https://nicecxone-sov1.au" },
                    { label: "EU Sovereign", value: "https://nicecxone-sov1.eu" },
                    { label: "Other", value: "other" }
                ],
                required: true
            }
        },
        {
            key: "baseUrl",
            label: "Environment Base URL",
            type: "text",
            description: "The Base URL (Issuer) for the CXone environment.",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            },
            defaultValue: "https://cxone.niceincontact.com"
        },
        {
            key: "action",
            label: "Exit Action (sent as P1)",
            type: "select",
            description: "Select the action to perform. It will be sent to CXone as the first (P1) parameter.",
            params: {
                options: [
                    { label: "Escalate to Agent", value: "Escalate" },
                    { label: "End Conversation", value: "End" }
                ],
                required: true
            }
        },
        {
            key: "businessNumber",
            label: "Business Unit Number",
            type: "cognigyText",
            description: "The CXone Business Unit Number.",
            params: {
                required: true
            }
        },
        {
            key: "contactId",
            label: "Main Contact ID",
            type: "cognigyText",
            description: "The CXone Main Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "spawnedContactId",
            label: "Spawned Contact ID",
            type: "cognigyText",
            description: "The CXone Spawned Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "transferIntent",
            label: "Exit Reason or Intent",
            type: "cognigyText",
            description: "Reason or Intent for Exiting Interaction."
        },
        {
            key: "optionalParamsMode",
            label: "Optional Parameters Mode",
            type: "select",
            description: "Choose how to send optional parameters to CXone.",
            defaultValue: "stringArray",
            params: {
                options: [
                    { label: "Array of JSON Objects (as P2)", value: "singleObject" },
                    { label: "Array of Strings (as P2, P3, etc.)", value: "stringArray" }
                ],
                required: true
            }
        },
        {
            key: "optionalParamsObject",
            label: "Optional Parameters: Array of JSON Objects",
            type: "json",
            description: "Provide an array of JSON objects to be sent as a single P2 parameter to CXone.",
            condition: {
                key: "optionalParamsMode",
                value: "singleObject"
            },
            defaultValue: "[]",
            params: {
                required: false
            }
        },
        {
            key: "optionalParamsArray",
            label: "Optional Parameters: Array of Strings",
            type: "json",
            description: "Provide an array of strings to be sent as multiple parameters (P2, P3, P4, etc.) to CXone.",
            condition: {
                key: "optionalParamsMode",
                value: "stringArray"
            },
            defaultValue: "[\"\", \"\"]",
            params: {
                required: false
            }
        },
        {
            key: "optionalParams",
            label: "Legacy Optional Parameters",
            type: "json",
            defaultValue: "[]",
            description: "Legacy value (hidden).",
            condition: {
                key: "__never__",
                value: "true"
            }
        }
    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "optionalParamsMode",
                "optionalParamsObject",
                "optionalParamsArray"
            ],
        }
    ],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "spawnedContactId" },
        { type: "field", key: "transferIntent"},
        { type: "field", key: "connection" },
        { type: "section", key: "advanced" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config }: IgetSendSignalParams) => {
        const { environment, baseUrl, action, businessNumber, contactId, spawnedContactId, connection, optionalParamsMode, optionalParamsObject, optionalParamsArray, transferIntent, optionalParams } = config;
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("handoverToCXone: CXone API Connection not found");
        }
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("handoverToCXone: Base URL is required when Environment is set to Other");
            }
        }
        if (!action) {
            api.output("handoverToCXone Error: Missing Action parameter", { error: "Missing Action parameter" });
            throw new Error("handoverToCXone: Missing Action parameter");
        }

        let tokenIssuer = environment;
        if (environment === "other") {
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        api.log("info", `handoverToCXone: Contact ID: ${contactId}; Spawned Contact ID: ${spawnedContactId}; Action: ${action}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);
        // get token URL based on environment
        // i.e.: "https://cxone.niceincontact.com/auth/token";
        const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
        api.log("info", `handoverToCXone: got token URL: ${tokenUrl}`);
        const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
        const cxOneConfig = {
            tokenUrl: tokenUrl,
            accessKeyId: connection.accessKeyId,
            accessKeySecret: connection.accessKeySecret,
            basicToken: basicToken
        };

        try {
            const channel = input?.channel || '';
            api.log("info", `handoverToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `handoverToCXone: isVoice: ${isVoice}`);

            // prepare optional parameters
            const mode = optionalParamsMode || "singleObject";
            let finalParams = [];

            if (mode === "stringArray" && Array.isArray(optionalParamsArray)) {
                finalParams = optionalParamsArray;
            } else if (mode === "singleObject" && optionalParamsObject) {
                finalParams = [JSON.stringify(optionalParamsObject)];
            } else if (optionalParams) {
                // fallback for legacy nodes
                if (Array.isArray(optionalParams)) {
                    finalParams = optionalParams;
                }
            } else if (typeof optionalParams === "object") {
                finalParams = [JSON.stringify(optionalParams)];
            }
            api.log("info", `handoverToCXone: prepared optional parameters: ${JSON.stringify(finalParams)}`);
            if (contactId && spawnedContactId && isVoice) {
                const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const decodedToken: any = jwt.decode(tokens.id_token);
                // api.log("info", `handoverToCXone: decoded id token:  ${JSON.stringify(decodedToken)}`);
                const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
                api.log("info", `handoverToCXone: got API endpoint URL: ${apiEndpointUrl}`);

                const transcript = input.transcript || context.transcript || '';
                // Send transcript to TMS if available
                if (transcript) {
                    api.log("info", `handoverToCXone: got transcript`);
                    try {
                        const tmsPayload = transformConversation(transcript, action as "End" | "Escalate", contactId, businessNumber);
                        const tmsStatus = await postToTMS(api, apiEndpointUrl, tokens.access_token, tmsPayload);
                        api.log("info", `handoverToCXone: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}; payload: ${JSON.stringify(tmsPayload)}`);
                    } catch (tmsError) {
                        api.log("error", `handoverToCXone: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                    }
                }
                const signalStatus = await sendSignalHandover(api, apiEndpointUrl, tokens.access_token, spawnedContactId || contactId, action, finalParams || []);
                api.log("info", `handoverToCXone: sent signal to CXone for contactId: ${spawnedContactId || contactId}; action: ${action}; status: ${signalStatus}`);
                api.addToContext("CXoneHandover", `Signaled CXone with: '${action}' for contactId: ${spawnedContactId || contactId}`, 'simple');
            }

            const tIntent = transferIntent.trim() ? transferIntent.trim() : "Intent Not Specified";
            const ndata: {
                _cognigy: {
                    _niceCXOne: {
                        json: {
                            text: string
                            uiComponent: object
                            data: any
                            action: string
                        }
                    }
                }
            } = {
                _cognigy: {
                    _niceCXOne: {
                        json: {
                            text: tIntent,
                            uiComponent: {
                                /*
                                intentInfo: {
                                    intent: tIntent
                                }
                                */
                            },
                            data: {
                                // contentType: "ExchangeResultOverride",
                                /*
                                content: {
                                    // vahExchangeResultBranch: "ReturnControlToScript",
                                    intent: tIntent
                                },
                                */
                                Intent: action
                            },
                            action: action === "End" ? "END_CONVERSATION" : "AGENT_TRANSFER"
                        }
                    }
                }
            };
            /*
            const data: { contentType: string; content: any; Intent: string; Params?: string } = {
                "contentType": "ExchangeResultOverride",
                "content": {
                        "vahExchangeResultBranch": "ReturnControlToScript",
                        "intent": tIntent
                },
                "Intent": action
            };
            */
            if (Array.isArray(finalParams) && finalParams.length) {
                 ndata._cognigy._niceCXOne.json.data.Params = finalParams.join('|');
                // data.Params = finalParams.join('|');
            }
            api.output("", ndata);
        } catch (error) {
            api.log("error", `handoverToCXone: Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${error.message}`);
            api.addToContext("CXoneHandover", `Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${error.message}`, 'simple');
            api.output("Something is not working. Please retry.", { error: error.message });
            throw error;
        }
    }
});