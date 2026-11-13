type WarnLogger = (level: "warn", msg: string) => void;

export function prepareParams(
    input: unknown,
    log?: WarnLogger,
    contextLabel: string = "prepareParams"
): string[] {
    if (Array.isArray(input)) {
        return input.map((p: unknown) => typeof p === "string" ? p : JSON.stringify(p));
    }
    if (typeof input === "string") {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) {
                return parsed.map((p: unknown) => typeof p === "string" ? p : JSON.stringify(p));
            }
        } catch {
            log?.("warn", `${contextLabel}: Could not parse as JSON: ${input}`);
        }
    }
    return [];
}
