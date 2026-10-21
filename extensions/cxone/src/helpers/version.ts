import { INodeDescriptor } from "@cognigy/extension-tools";

// The extension version, read from the package.json that ships next to build/, so every node's log
// shows which build actually ran - the rest of the log looks the same from one version to the next.
let version = "unknown";
try {
    version = require("../../package.json").version || "unknown";
} catch {
    // a missing or unreadable package.json must never break a node
}

export const EXTENSION_VERSION: string = version;

// Cognigy: "Extensions can make up to 10 API calls per execution, except for api.log()".
export const COGNIGY_API_CALL_LIMIT = 10;

// Every api function counts against the limit, except log.
const isCounted = (name: PropertyKey): name is string => typeof name === "string" && name !== "log";

// Describes a call for the log without its value - context values can hold customer data
const describeCall = (name: string, args: any[]): string =>
    (name === "addToContext" || name === "addToInput") && typeof args[0] === "string" ? `${name} ${args[0]}` : name;

/**
 * Wraps a node descriptor's function so that every run logs, through api.log() only (which has no
 * call limit):
 *   - the extension version, first
 *   - each Cognigy API call it makes, numbered against the limit
 *   - how many calls it used in total, last
 * If Cognigy ever stops a node for making too many calls, the log shows exactly which call it was.
 * The node itself is unchanged: it receives the same cognigy object, with only `api` counted.
 */
export const instrumentNode = (nodeName: string, descriptor: INodeDescriptor): INodeDescriptor => {
    const run = descriptor.function;
    if (!run) return descriptor;

    descriptor.function = async (params: any) => {
        const cognigy = params?.cognigy;
        const api = cognigy?.api;
        if (!api) return run(params);

        api.log?.("info", `${nodeName}: CXone extension v${EXTENSION_VERSION}`);

        // Both views proxy an EMPTY object and read through to Cognigy's real one. A proxy of the real
        // object would have to return its exact values if Cognigy ever froze it, which would make the
        // counting wrapper throw; an empty target carries no such constraint, whatever its shape.
        // Property reads and `in` checks are forwarded; enumerating the views (Object.keys, spread,
        // JSON.stringify) sees an empty object, so nodes must not copy `api` or `cognigy` wholesale.
        let calls = 0;
        const countedApi = new Proxy({}, {
            has: (_target: object, property: PropertyKey): boolean => Reflect.has(api, property),
            get(_target: object, property: PropertyKey): any {
                const value = Reflect.get(api, property);
                if (typeof value !== "function") return value;
                if (!isCounted(property)) return value.bind(api);
                return (...args: any[]) => {
                    calls += 1;
                    api.log?.("info", `${nodeName}: Cognigy API call ${calls} of ${COGNIGY_API_CALL_LIMIT} (${describeCall(property, args)})`);
                    return value.apply(api, args);
                };
            }
        });
        const countedCognigy = new Proxy({}, {
            has: (_target: object, property: PropertyKey): boolean => Reflect.has(cognigy, property),
            get: (_target: object, property: PropertyKey): any => property === "api" ? countedApi : Reflect.get(cognigy, property)
        });

        try {
            return await run({ ...params, cognigy: countedCognigy });
        } finally {
            api.log?.("info", `${nodeName}: finished, used ${calls} of ${COGNIGY_API_CALL_LIMIT} Cognigy API calls`);
        }
    };

    return descriptor;
};
