import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import transformConversation, { resolveMediaType } from '../helpers/tms-payload.js';
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignalHandover, postToTMS, makeTokenRefresher } from "../helpers/cxone-utils.js";
import { isTmsTranscriptPosted, getTmsPostedStatus, setTmsPostedStatus, resolveTranscript } from "../helpers/tms-guard.js";
import { tryParseJsonField } from "../helpers/json-field.js";
import { redactTmsPayload } from "../helpers/redact.js";

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
    summary: "Escalate to Agent or End Conversation by returning control to CXone. Send transcript to TMS.",
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
            // no default: this field only appears for 'Other', where pre-filling a listed
            // environment would quietly point the node somewhere the builder did not choose
            description: "The Base URL (Issuer) of your CXone environment, e.g. https://cxone.niceincontact.com",
            condition: { key: "environment", value: "other" },
            params: {
                required: true
            }
        },
        {
            key: "action",
            label: "Exit Action",
            type: "select",
            description: "Select the action to perform.",
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
            defaultValue: "{{context.data.contactId}}",
            params: {
                required: true
            }
        },
        {
            key: "spawnedContactId",
            label: "Spawned Contact ID",
            type: "cognigyText",
            description: "The CXone Spawned Contact ID.",
            defaultValue: "{{context.data.spawnedContactId}}",
            params: {
                required: true
            }
        },
        {
            key: "optionalParamsObject",
            label: "Parameters (optional): Array of JSON Objects",
            type: "json",
            description: "Provide an array of JSON objects to be sent to CXone.",
            defaultValue: "[]",
            params: {
                required: false
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "spawnedContactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "optionalParamsObject" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const config = rawConfig as IgetSendSignalParams["config"];
        const { environment, baseUrl, action, connection, optionalParamsObject } = config;
        // identifiers are trimmed: a value resolved from a SIP header or CognigyScript can carry
        // whitespace, which would break the signal URL, the TMS payload and the duplicate guard
        const businessNumber = (config.businessNumber || "").trim();
        const contactId = (config.contactId || "").trim();
        const spawnedContactId = (config.spawnedContactId || "").trim();
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("handoverToCXone: CXone API Connection not found");
        }
        if (!action) {
            // configuration error - report it to the flow, never to the customer
            throw new Error("handoverToCXone: Missing Action parameter");
        }

        // validate and resolve the token issuer in one block, so baseUrl is known to be set below
        let tokenIssuer = environment;
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("handoverToCXone: Base URL is required when Environment is set to Other");
            }
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        api.log?.("info", `handoverToCXone: Contact ID: ${contactId}; Spawned Contact ID: ${spawnedContactId}; Action: ${action}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);
        try {
            const channel = input?.channel || '';
            api.log?.("info", `handoverToCXone: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log?.("info", `handoverToCXone: isVoice: ${isVoice}`);

            // prepare optional parameters - the json field can arrive as an array or as a JSON string.
            // An invalid value is ignored rather than thrown, so it can never block the handover itself.
            let finalParams: string[] = [];
            const parsedOptionalParams = tryParseJsonField(api, optionalParamsObject, "handoverToCXone: Parameters (optional)");

            if (Array.isArray(parsedOptionalParams) && parsedOptionalParams.length > 0) {
                finalParams = [JSON.stringify(parsedOptionalParams)];
            } else if (parsedOptionalParams !== undefined && !Array.isArray(parsedOptionalParams)) {
                api.log?.("warn", `handoverToCXone: 'Parameters (optional)' is not a JSON array; ignoring it: ${JSON.stringify(parsedOptionalParams)}`);
            }
            api.log?.("info", `handoverToCXone: prepared optional parameters: ${JSON.stringify(finalParams)}`);

            if (contactId && spawnedContactId && isVoice && contactId !== "100000000000" && spawnedContactId !== "100000000000") {
                // get token URL based on environment
                const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
                api.log?.("info", `handoverToCXone: got token URL: ${tokenUrl}`);
                const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');
                const cxOneConfig = {
                    tokenUrl: tokenUrl,
                    accessKeyId: connection.accessKeyId,
                    accessKeySecret: connection.accessKeySecret,
                    basicToken: basicToken
                };

                const tokens = await getToken(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);
                const decodedToken: any = jwt.decode(tokens.id_token);
                const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
                api.log?.("info", `handoverToCXone: got API endpoint URL: ${apiEndpointUrl}`);
                // lets the calls below survive a token that CXone considers expired
                const refreshToken = makeTokenRefresher(api, context, cxOneConfig.basicToken, cxOneConfig.accessKeyId, cxOneConfig.accessKeySecret, cxOneConfig.tokenUrl);

                // Skip the TMS post if a 'Send Transcript to TMS' node (or an earlier run of this node) already posted it
                if (isTmsTranscriptPosted(context, contactId)) {
                    api.log?.("info", `handoverToCXone: Transcript was already posted to TMS for contactId: ${contactId} (status: '${getTmsPostedStatus(context)}'); skipping TMS post.`);
                } else {
                    const { transcript, reason } = resolveTranscript(api, input, context, "handoverToCXone");
                    // Send transcript to TMS if available
                    if (transcript) {
                        try {
                            const mediaType = resolveMediaType(channel);
                            const tmsPayload = transformConversation(transcript, action as "End" | "Escalate", contactId, businessNumber, mediaType);
                            // every item was filtered out (e.g. data-only inputs) - an empty transcript is not worth posting
                            if (tmsPayload.selfServiceSessionDetails.transcripts.length === 0) {
                                api.log?.("warn", `handoverToCXone: the transcript holds no messages with text; nothing posted to TMS for contactId: ${contactId}.`);
                                setTmsPostedStatus(api, context, "skipped", `Transcript holds no messages with text for contactId: ${contactId}`);
                            } else {
                                api.log?.("info", `handoverToCXone: tmsPayload (transcript redacted): ${JSON.stringify(redactTmsPayload(tmsPayload))}`);
                                const tmsStatus = await postToTMS(api, apiEndpointUrl, tokens.access_token, tmsPayload, refreshToken);
                                api.log?.("info", `handoverToCXone: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`);
                                setTmsPostedStatus(api, context, "posted", `Posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`, contactId);
                            }
                        } catch (tmsError: any) {
                            api.log?.("error", `handoverToCXone: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                            setTmsPostedStatus(api, context, "failed", `Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                        }
                    } else {
                        setTmsPostedStatus(api, context, "skipped", `${reason} for contactId: ${contactId}`);
                    }
                }
                const signalStatus = await sendSignalHandover(api, apiEndpointUrl, tokens.access_token, spawnedContactId || contactId, action, finalParams, refreshToken);
                api.log?.("info", `handoverToCXone: sent signal to CXone for contactId: ${spawnedContactId || contactId}; action: ${action}; status: ${signalStatus}`);
                api.addToContext?.("CXoneHandover", `Signaled CXone with: '${action}' for contactId: ${spawnedContactId || contactId}`, 'simple');
            }

            // Output the handover action to NiCE channel for CXone Guide Chat
            if (!isVoice && contactId && contactId !== "100000000000") {
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
                                text: "",
                                uiComponent: {
                                    /*
                                    intentInfo: {
                                        intent: tIntent
                                    }
                                    */
                                },
                                data: {
                                    Intent: action
                                },
                                action: action === "End" ? "END_CONVERSATION" : "AGENT_TRANSFER"
                            }
                        }
                    }
                };
                if (Array.isArray(finalParams) && finalParams.length) {
                    ndata._cognigy._niceCXOne.json.data.Params = finalParams.join('|');
                }
                api.output?.("", ndata);
                api.log?.("info", `handoverToCXone: Done. Output data was sent to CXone Guide Chat channel: ${JSON.stringify(ndata)}`);
            } else {
                api.log?.("info", `handoverToCXone: Done. No output data sent to Voice / Cognigy Webchat / Cognigy Testchat channel.`);
            }
            // wait 5 seconds - to not get unwanted messages from Cognigy during handover
            await new Promise(resolve => setTimeout(resolve, 5000));
            return;
        } catch (error: any) {
            api.log?.("error", `handoverToCXone: Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${error.message}`);
            api.addToContext?.("CXoneHandover", `Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${error.message}`, 'simple');
            // the error details stay in the log and in the context - they are not sent to the channel
            api.output?.("Something is not working. Please retry.", null);
            throw error;
        }
    }
});
