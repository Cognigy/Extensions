import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as jwt from "jsonwebtoken";
import transformConversation, { resolveMediaType } from '../helpers/tms-payload.js';
import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, postToTMS, makeTokenRefresher } from "../helpers/cxone-utils.js";
import { isTmsTranscriptPosted, getTmsPostedStatus, setTmsPostedStatus, resolveTranscript } from "../helpers/tms-guard.js";
import { redactTmsPayload } from "../helpers/redact.js";

export interface IsendTranscriptToTMSParams extends INodeFunctionBaseParams {
    config: {
        environment: string;
        baseUrl?: string;
        action: string;
        mediaType?: string;
        contactId: string;
        businessNumber: string;
        connection: {
            accessKeyId: string;
            accessKeySecret: string;
            clientId: string;
            clientSecret: string;
        };
    };
}

export const sendTranscriptToTMS = createNodeDescriptor({
    type: "sendTranscriptToTMS",
    defaultLabel: "Send Transcript to TMS",
    summary: "Post the conversation transcript to the CXone Transcript Management System (TMS). Posted only once per conversation.",
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
            label: "Session Completion",
            type: "select",
            description: "How the self service session ended. 'End Conversation' is posted as CONTAINED, 'Escalate to Agent' as ESCALATED.",
            params: {
                options: [
                    { label: "Escalate to Agent", value: "Escalate" },
                    { label: "End Conversation", value: "End" }
                ],
                required: true
            }
        },
        {
            key: "mediaType",
            label: "Media Type",
            type: "select",
            description: "How CXone should record the interaction. 'Auto' uses the Cognigy channel: a voice channel is reported as Voice, everything else as Digital.",
            defaultValue: "auto",
            params: {
                options: [
                    { label: "Auto (from the channel)", value: "auto" },
                    { label: "Voice", value: "Voice" },
                    { label: "Digital", value: "Digital" }
                ],
                required: true
            }
        },
        {
            key: "businessNumber",
            label: "Business Unit Number",
            type: "cognigyText",
            description: "The CXone Business Unit Number.",
            defaultValue: "4597359",
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
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "environment" },
        { type: "field", key: "baseUrl" },
        { type: "field", key: "action" },
        { type: "field", key: "mediaType" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "connection" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const config = rawConfig as IsendTranscriptToTMSParams["config"];
        const { environment, baseUrl, action, connection } = config;
        // identifiers are trimmed: a value resolved from a SIP header or CognigyScript can carry
        // whitespace, which would break the TMS payload and the duplicate guard
        const businessNumber = (config.businessNumber || "").trim();
        const contactId = (config.contactId || "").trim();
        const { api, input, context } = cognigy;

        if (!connection) {
            throw new Error("sendTranscriptToTMS: CXone API Connection not found");
        }
        if (!action) {
            throw new Error("sendTranscriptToTMS: Missing Session Completion parameter");
        }
        if (!contactId) {
            throw new Error("sendTranscriptToTMS: Missing Main Contact ID parameter");
        }
        if (!businessNumber) {
            throw new Error("sendTranscriptToTMS: Missing Business Unit Number parameter");
        }

        // Do not post the transcript twice for the same contact
        if (isTmsTranscriptPosted(context, contactId)) {
            api.log?.("info", `sendTranscriptToTMS: Transcript was already posted to TMS for contactId: ${contactId} (status: '${getTmsPostedStatus(context)}'); skipping.`);
            return;
        }

        // No point in posting for Testchat / Webchat placeholder contacts
        if (contactId === "100000000000") {
            api.log?.("warn", `sendTranscriptToTMS: Placeholder contactId '${contactId}' (no real CXone interaction); skipping TMS post.`);
            setTmsPostedStatus(api, context, "skipped", `Placeholder contactId: ${contactId}`);
            return;
        }

        // validate and resolve the token issuer in one block, so baseUrl is known to be set below
        let tokenIssuer = environment;
        if (environment === "other") {
            if (!baseUrl || baseUrl.trim() === "") {
                throw new Error("sendTranscriptToTMS: Base URL is required when Environment is set to Other");
            }
            tokenIssuer = baseUrl.trim().replace(/\/+$/, ''); // remove trailing slashes
        }

        api.log?.("info", `sendTranscriptToTMS: Contact ID: ${contactId}; Session Completion: ${action}; Environment: ${environment}; Environment Base URL: ${tokenIssuer}`);

        const { transcript, reason } = resolveTranscript(api, input, context, "sendTranscriptToTMS");
        if (!transcript) {
            setTmsPostedStatus(api, context, "skipped", `${reason} for contactId: ${contactId}`);
            return;
        }

        try {
            // get token URL based on environment
            const tokenUrl = await getCxoneOpenIdUrl(api, context, tokenIssuer);
            api.log?.("info", `sendTranscriptToTMS: got token URL: ${tokenUrl}`);
            const basicToken = Buffer.from(`${connection.clientId}:${connection.clientSecret}`).toString('base64');

            const tokens = await getToken(api, context, basicToken, connection.accessKeyId, connection.accessKeySecret, tokenUrl);
            const decodedToken: any = jwt.decode(tokens.id_token);
            const apiEndpointUrl = await getCxoneConfigUrl(api, context, decodedToken.iss, decodedToken.tenantId);
            api.log?.("info", `sendTranscriptToTMS: got API endpoint URL: ${apiEndpointUrl}`);

            // "Auto" follows the Cognigy channel: voice -> Voice, anything else -> Digital
            const mediaType = resolveMediaType(input?.channel, config.mediaType);
            api.log?.("info", `sendTranscriptToTMS: media type: ${mediaType} (setting: ${config.mediaType || "auto"}; channel: ${input?.channel || "unknown"})`);
            const tmsPayload = transformConversation(transcript, action as "End" | "Escalate", contactId, businessNumber, mediaType);
            // every item was filtered out (e.g. data-only inputs) - an empty transcript is not worth posting
            if (tmsPayload.selfServiceSessionDetails.transcripts.length === 0) {
                api.log?.("warn", `sendTranscriptToTMS: the transcript holds no messages with text; nothing posted to TMS for contactId: ${contactId}.`);
                setTmsPostedStatus(api, context, "skipped", `Transcript holds no messages with text for contactId: ${contactId}`);
                return;
            }
            api.log?.("info", `sendTranscriptToTMS: tmsPayload (transcript redacted): ${JSON.stringify(redactTmsPayload(tmsPayload))}`);
            // lets the post survive a token that CXone considers expired
            const refreshToken = makeTokenRefresher(api, context, basicToken, connection.accessKeyId, connection.accessKeySecret, tokenUrl);
            const tmsStatus = await postToTMS(api, apiEndpointUrl, tokens.access_token, tmsPayload, refreshToken);
            api.log?.("info", `sendTranscriptToTMS: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`);
            setTmsPostedStatus(api, context, "posted", `Posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`, contactId);
        } catch (tmsError: any) {
            api.log?.("error", `sendTranscriptToTMS: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
            setTmsPostedStatus(api, context, "failed", `Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
        }
        return;
    }
});
