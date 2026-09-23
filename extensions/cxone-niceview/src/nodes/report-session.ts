import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { classifyChannel } from "../helpers/channel";
import { ISessionReport, postSessionReport, redactSessionReport } from "../helpers/demo-log";

// The demo name is the ONLY marker of the AI Agent Hub.
const AI_AGENT_HUB_SUFFIX = /_ai-agent-hub\s*$/i;

/**
 * A value as the demo log should receive it.
 *
 * SIP header values are JSON and can arrive nested - this extension already unwraps an
 * ivaParams that came through as `{value: "..."}` - so a field that should be text can be
 * an object. Reporting an empty field says "we do not know"; reporting "[object Object]"
 * puts a lie in the log.
 */
const asText = (value: any): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return "";
    return String(value);
};

/** The user token can arrive on context.data directly, or nested in the demo's iva parameters. */
const readUserToken = (data: Record<string, any>): string => {
    if (data.userToken) return asText(data.userToken);
    if (data.ivaParams && data.ivaParams.contextData && data.ivaParams.contextData.userToken) {
        return asText(data.ivaParams.contextData.userToken);
    }
    return "";
};

export const reportNiCEviewSession = createNodeDescriptor({
    type: "reportNiCEviewSession",
    defaultLabel: "Report Session",
    summary: "Report the demo session to demo log, once per session",
    fields: [],
    sections: [],
    form: [],
    appearance: {
        color: "#A060F1"
    },
    function: async ({ cognigy }: INodeFunctionBaseParams) => {
        const { api, input, context } = cognigy;

        try {
            const data: Record<string, any> = context.data || {};

            const flowChannel = asText(data.flowChannel);
            const contactId = asText(data.contactId);
            const ani = asText(data.ani);
            const userToken = readUserToken(data);

            // the dispatcher records which demo flow it chose; fall back to the flow in the context
            let demoFlowId = asText(context.demoFlowId);
            if (!demoFlowId && data.flowId) {
                demoFlowId = asText(data.flowId);
            }

            const { isTelephony, isWebrtc, isWebchat, isGuideChat, isBrowserChannel } = classifyChannel(data);
            const isHub = AI_AGENT_HUB_SUFFIX.test(String(data.demoName || "").trim());

            // A browser-channel run of the AI Agent Hub is someone clicking around our own
            // page, not a demo worth a row in the log.
            const isWorthReporting =
                (isTelephony || isGuideChat || isWebrtc || isWebchat) && !(isBrowserChannel && isHub);

            // Once per SESSION, not once per turn: the node can sit on a path the flow
            // walks repeatedly, and the report describes the session, not the turn.
            if (!isWorthReporting || context.demoLogReported) {
                const reason = !isWorthReporting ? `channel ${flowChannel || "(none)"} is not reported` : "already reported for this session";
                api.log?.("info", `reportNiCEviewSession: nothing to report - ${reason}`);
                api.addToContext?.("sessionReport", null, "simple");
                return;
            }

            const sessionReport: ISessionReport = {
                flow_id: demoFlowId,
                flow_channel: flowChannel,
                contact_id: contactId,
                session_id: asText(input?.sessionId),
                cognigy_user_id: asText(input?.userId),
                project_id: asText(input?.projectId),
                user_token: userToken,
                ani,
                demo_name: asText(data.demoName)
            };

            // set before the post, so a service that is slow or down cannot cause a second report
            api.addToContext?.("demoLogReported", true, "simple");
            api.addToContext?.("sessionReport", sessionReport, "simple");
            api.addToContext?.("demoLogStartedAt", Date.now(), "simple");

            api.log?.("info", `reportNiCEviewSession: reporting session (ani and user token redacted): ${JSON.stringify(redactSessionReport(sessionReport))}`);

            const result = await postSessionReport(api, sessionReport, String(context.demoLogId || "").trim());

            api.addToContext?.("demoLogResult", result.body, "simple");
            api.addToContext?.("demoLogStatus", result.status, "simple");

            if (result.id) {
                // kept so a later node can update this row instead of creating a second one
                api.addToContext?.("demoLogId", result.id, "simple");
                api.log?.("info", `reportNiCEviewSession: session reported, demo log id ${result.id}`);
            } else if (!result.error) {
                api.log?.("warn", `reportNiCEviewSession: the demo log accepted the report (${result.status}) but returned no id`);
            }
        } catch (error) {
            // telemetry must never break the demo it is reporting on
            api.log?.("error", `reportNiCEviewSession: Error reporting session: ${(error as Error).message}`);
            api.addToContext?.("reportNiCEviewSession", `Error reporting session: ${(error as Error).message}`, "simple");
        }
    }
});
