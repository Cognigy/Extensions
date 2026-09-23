// Posting a session report to the NiCEview demo-log service.
//
// The service records one row per demo session, so the team can see which demos were run,
// on which channel, and by whom. It is telemetry: a failed post is reported to the flow but
// never stops the demo.

import { mask } from "./redact";
// The endpoint and the key are not committed - see secrets.example.ts
import { DEMO_LOG_FLOW_KEY, DEMO_LOG_URL } from "./secrets.local";

const FLOW_PATH = "/demo-logs/flow/";

// A demo must not wait on its own telemetry: a live voice call is on the other end of this.
const REQUEST_TIMEOUT_MS = 5000;

// AbortSignal.timeout needs Node 17.3+; on anything older the request simply has no deadline
// rather than the node failing outright.
const requestDeadline = (): any => {
    const signals: any = typeof AbortSignal !== "undefined" ? AbortSignal : undefined;
    return signals && typeof signals.timeout === "function" ? signals.timeout(REQUEST_TIMEOUT_MS) : undefined;
};

export interface ISessionReport {
    flow_id: string;
    flow_channel: string;
    contact_id: string;
    session_id: string;
    cognigy_user_id: string;
    project_id: string;
    user_token: string;
    ani: string;
    demo_name: string;
}

export interface IDemoLogResult {
    /** HTTP status, or 0 when the request never completed */
    status: number;
    /** The parsed response body, or the raw text when it is not JSON */
    body: any;
    /** The demo-log id the service answered with, when it gave one */
    id: string;
    error?: string;
}

/**
 * The report carries the caller's number and the demo's user token; neither belongs in a log line.
 */
export const redactSessionReport = (report: ISessionReport): Record<string, any> => ({
    ...report,
    ani: report.ani ? mask(report.ani) : "",
    user_token: report.user_token ? mask(report.user_token) : ""
});

/**
 * Reads the demo-log id out of a service response.
 *
 * The Cognigy HTTP node this replaces wrapped the body as {length, result, statusCode}, and
 * the flow read the id from either `result.id` or a top-level `id`. Both shapes are still
 * accepted, because which one this node sees depends on the service, not on us.
 */
const readDemoLogId = (body: any): string => {
    if (!body || typeof body !== "object") return "";
    if (body.id) return String(body.id);
    if (body.result && body.result.id) return String(body.result.id);
    return "";
};

/**
 * One request to the demo log. Never throws - a transport failure comes back as status 0 with
 * the reason in `error`, so the caller can record it without breaking the demo flow.
 *
 * `label` is the calling node, so a log line says which report failed.
 */
const sendToDemoLog = async (api: any, label: string, method: "POST" | "PUT", demoLogId: string, payload: any): Promise<IDemoLogResult> => {
    // an empty id addresses the collection - that is what creates the row
    const url = `${DEMO_LOG_URL}${FLOW_PATH}${encodeURIComponent(demoLogId)}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "x-flow-key": DEMO_LOG_FLOW_KEY
            },
            body: JSON.stringify(payload),
            signal: requestDeadline()
        });

        const responseText = await response.text();
        let body: any;
        try {
            body = JSON.parse(responseText);
        } catch {
            // a gateway error answers with HTML; keep it short and say so plainly
            body = responseText.slice(0, 200);
        }

        if (!response.ok) {
            api.log?.("error", `${label}: demo-log service returned ${response.status}`);
            return { status: response.status, body, id: "", error: `HTTP ${response.status}` };
        }

        return { status: response.status, body, id: readDemoLogId(body) };
    } catch (error) {
        const message = (error as Error).message;
        api.log?.("error", `${label}: could not reach the demo-log service: ${message}`);
        return { status: 0, body: null, id: "", error: message };
    }
};

/** Creates the row for a session. An empty `demoLogId` is what makes it a create. */
export const postSessionReport = async (api: any, report: ISessionReport, demoLogId: string): Promise<IDemoLogResult> =>
    sendToDemoLog(api, "reportNiCEviewSession", "POST", demoLogId, report);

export interface ISessionEnd {
    /** a string, matching what the Cognigy HTTP node sent ("{{context.demoLogDuration}}") */
    duration_seconds: string;
    metadata: {
        outcome: string;
    };
}

/** Updates the row created by postSessionReport with how the session went. */
export const putSessionEnd = async (api: any, demoLogId: string, sessionEnd: ISessionEnd): Promise<IDemoLogResult> =>
    sendToDemoLog(api, "reportNiCEviewSessionEnd", "PUT", demoLogId, sessionEnd);
