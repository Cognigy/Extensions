import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { ISessionEnd, putSessionEnd } from "../helpers/demo-log";

export const reportNiCEviewSessionEnd = createNodeDescriptor({
    type: "reportNiCEviewSessionEnd",
    defaultLabel: "Report Session End",
    summary: "Close the demo log with how long the session ran and how it ended",
    fields: [],
    sections: [],
    form: [],
    appearance: {
        color: "#A060F1"
    },
    function: async ({ cognigy }: INodeFunctionBaseParams) => {
        const { api, context } = cognigy;

        try {
            // Once per SESSION, not once per turn. A session ends once: a second run would
            // overwrite the recorded duration with however long the flow happened to keep
            // running afterwards, so the first close is the one that counts.
            if (context.demoLogEndReported) {
                api.log?.("info", `reportNiCEviewSessionEnd: this session was already closed after ${context.demoLogDuration}s`);
                return;
            }

            // How long the session ran. A missing start time, or a clock that moved backwards,
            // reads as 0 rather than as a negative or a nonsense duration.
            const started = Number(context.demoLogStartedAt);
            let seconds = 0;
            if (Number.isFinite(started) && started > 0) {
                seconds = Math.round((Date.now() - started) / 1000);
            }
            if (!Number.isFinite(seconds) || seconds < 0) {
                seconds = 0;
            }
            api.addToContext?.("demoLogDuration", seconds, "simple");

            // Without an id there is no row to close - the session was never worth reporting,
            // or the report never reached the service. The guard stays off: if the report node
            // runs later and does get an id, this node can still close it.
            const demoLogId = String(context.demoLogId || "").trim();
            if (!demoLogId) {
                api.log?.("info", "reportNiCEviewSessionEnd: no demo log id for this session, nothing to close");
                return;
            }

            // set before the request, so a service that is slow or down cannot cause a second close
            api.addToContext?.("demoLogEndReported", true, "simple");

            // How the session ended, when the flow bothered to say. An outcome that arrived as
            // an object would otherwise be sent as "[object Object]".
            const asText = (value: any): string =>
                (value === undefined || value === null || typeof value === "object") ? "" : String(value);
            const outcome = asText(context.demoLogOutcome).trim();

            const sessionEnd: ISessionEnd = {
                duration_seconds: String(seconds),
                metadata: { outcome }
            };

            api.log?.("info", `reportNiCEviewSessionEnd: closing demo log ${demoLogId} after ${seconds}s, outcome "${outcome}"`);

            const result = await putSessionEnd(api, demoLogId, sessionEnd);

            api.addToContext?.("demoLogResultSessionEnd", result.body, "simple");
            api.addToContext?.("demoLogStatusSessionEnd", result.status, "simple");
        } catch (error) {
            // telemetry must never break the demo it is reporting on
            api.log?.("error", `reportNiCEviewSessionEnd: Error closing the session: ${(error as Error).message}`);
            api.addToContext?.("reportNiCEviewSessionEnd", `Error closing the session: ${(error as Error).message}`, "simple");
        }
    }
});
