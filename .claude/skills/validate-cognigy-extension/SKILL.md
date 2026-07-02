---
name: validate-cognigy-extension
description: Validate that a Cognigy Extension's source code follows the repo's required structure BEFORE a pull request is confirmed/merged. Use when the user asks to check/validate/review an extension's structure, prepare an extension for a PR, or confirm an extension is structured correctly. Inspects only raw source — the extension folder layout, the .ts files under src/, and package.json — then reports in plain text what is wrong and shows an example of the correct form so the contributor can fix it. Does NOT inspect build/ output, node_modules, or run the code.
---

# Validate Cognigy Extension Structure

You are a structure gate for Cognigy.AI Extensions. Given an extension (a folder under `extensions/<name>/`), verify its raw source conforms to the conventions below and produce a **clear, plain-text report** of every deviation, each paired with **a short example of the correct form**. The goal is to let a collaborator fix the structure before their pull request is confirmed.

## Scope

- Inspect ONLY: the extension folder layout, the `.ts` files under `src/`, and `package.json`.
- Do NOT read `build/`, `*.tar.gz`, `node_modules/`, or `package-lock.json` for validation purposes.
- Do NOT compile or run anything.
- Localization (`deDE`, `esES`, etc.) is OPTIONAL — never flag a plain-string label or a missing translation as a problem.

## How to run the check

1. Determine which extension(s) to validate.
   - If the user named one, use `extensions/<name>/`.
   - Otherwise infer from `git status` / `git diff --name-only <base>...HEAD` — validate every `extensions/<name>/` that has changed source.
2. Glob the source: `extensions/<name>/**/*.ts` (exclude `build/`, `node_modules/`) and list the extension's root files.
3. Read `package.json`, `src/module.ts`, every node file under `src/nodes/`, and every connection file under `src/connections/`.
4. Check each rule in the **Required structure** section below.
5. Emit the report in the **Output format** below. If everything passes, say so explicitly and clearly.

## Required structure

### A. Extension folder layout
```
extensions/<name>/
├── package.json
├── tsconfig.json
├── tslint.json
├── README.md          # describes every node in detail (required for approval)
├── icon.png
└── src/
    ├── module.ts                 # entry point
    ├── nodes/                    # one file per node (may be grouped in subfolders)
    │   └── <feature>/<nodeName>.ts
    ├── connections/              # one file per connection schema (only if auth is needed)
    │   └── <connectionName>.ts
    └── helpers/
        └── <helper-function>.ts  # can be multiple files with one function each or one file with all functions (may be grouped in subfolders)
```
- `src/module.ts` MUST exist and be the entry point.
- Node logic MUST live under `src/nodes/`. Connection schemas (if any) MUST live under `src/connections/`.
- Build artifacts (`build/`, `*.tar.gz`) MUST NOT be committed — they belong in `.gitignore`. Flag them if tracked.
- Helper/util files are acceptable, but they must sit under `src/` (e.g. `src/helpers/`) and be imported with relative paths.

### B. `package.json` shape
Required fields and conventions:
- `"name"` — lowercase, matches the folder name.
- `"version"` — semver string. Must have the pattern 4.x.x
- `"description"` — non-empty.
- `"main": "build/module.js"`
- `"scripts"` — must include at least:
  - `"transpile": "tsc -p ."`
  - `"lint": "tslint -c tslint.json src/**/*.ts"`
  - `"build": "npm run transpile && npm run lint && npm run zip"`
  - `"zip"` — a `tar` command bundling `build/*`, `package.json`, `package-lock.json`, `README.md`, `icon.png`.
- `"keywords"` — An array relevant for the extension. 
- `"license": "MIT"`
- `"dependencies"` — must include `"@cognigy/extension-tools"`.
- No hardcoded secrets, tokens, or passwords anywhere in source (call out any you find).

### C. `src/module.ts`
- Imports `createExtension` from `@cognigy/extension-tools`.
- Imports every exported node descriptor and connection schema used.
- Default-exports `createExtension({ nodes: [...], connections: [...], options: { label: "<Display Name>" } })`.
- Every node/connection exported in the codebase should be registered here; every entry in the arrays must resolve to a real import.

Example:
```ts
import { createExtension } from "@cognigy/extension-tools";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/tickets/getTicket";
import { freshdeskAPIKeyConnection } from "./connections/freshdeskAPIKeyConnection";

export default createExtension({
    nodes: [ getTicketNode, onFoundTicket, onNotFoundTicket ],
    connections: [ freshdeskAPIKeyConnection ],
    options: { label: "Freshdesk" }
});
```

### D. Node files (`createNodeDescriptor`)
Each node file must:
- Declare a typed params interface extending `INodeFunctionBaseParams`, with a `config: {...}` shape that lists every field key used.
- Export a `const <name>Node = createNodeDescriptor({...})` with:
  - `type` — unique string across the extension; matches the import wiring in `module.ts`.
  - `defaultLabel` — present (string or localized object).
  - `fields[]` — each field has a `key`, `label`, `type`, and `params` where applicable.
  - `form[]` — layout array. **Every `{ type: "field", key }` must reference a key that exists in `fields[]`, and every `{ type: "section", key }` must reference a key defined in `sections[]`.** A `form` that points at a non-existent section or field is a hard error.
  - `function: async ({ cognigy, config }: I...Params) => { ... }` — the runtime logic.
- If the node groups fields, the `sections[]` array must define each section referenced by `form`, and each section's `fields[]` must list real field keys.
- A node that calls an external API should use a `connection` field whose `params.connectionType` matches a connection schema's `type`.
- Result storage convention: a `storeLocation` select (`input`/`context`) plus `inputKey`/`contextKey` text fields (conditioned on `storeLocation`), written via `api.addToInput(...)` / `api.addToContext(...)` inside a try/catch.
- All functions not related to typing and field structure must either be part of the runtime logic or be placed in a `.ts` file under `src/helpers/` (optionally grouped in subfolders).
- Prefer `const` and `let` over `var`.
- Keep code human-readable: avoid single-letter variable names (e.g., prefer `inputData` over `a`).
- Errors must be written to the selected storage location via `api.addToContext(...)` or `api.addToInput(...)`; optionally also log them via `api.log("error", ...)`.

Minimal correct shape:
```ts
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IGetThingParams extends INodeFunctionBaseParams {
    config: {
        connection: { key: string };
        thingId: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const getThingNode = createNodeDescriptor({
    type: "getThing",
    defaultLabel: "Get Thing",
    summary: "Retrieves a thing",
    fields: [
        { key: "connection", label: "Connection", type: "connection", params: { connectionType: "thing-apikey", required: true } },
        { key: "thingId", label: "Thing ID", type: "cognigyText", params: { required: true } },
        { key: "storeLocation", label: "Where to store the result", type: "select", defaultValue: "input",
          params: { options: [{ label: "Input", value: "input" }, { label: "Context", value: "context" }], required: true } },
        { key: "inputKey", label: "Input Key", type: "cognigyText", defaultValue: "thing", condition: { key: "storeLocation", value: "input" } },
        { key: "contextKey", label: "Context Key", type: "cognigyText", defaultValue: "thing", condition: { key: "storeLocation", value: "context" } }
    ],
    sections: [
        { key: "storage", label: "Storage Option", defaultCollapsed: true, fields: ["storeLocation", "inputKey", "contextKey"] }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "thingId" },
        { type: "section", key: "storage" }
    ],
    appearance: { color: "#20a849" },
    function: async ({ cognigy, config }: IGetThingParams) => {
        const { api } = cognigy;
        const { thingId, connection, storeLocation, inputKey, contextKey } = config;
        try {
            // ...call API...
            const result = {};
            if (storeLocation === "context") api.addToContext(contextKey, result, "simple");
            else api.addToInput(inputKey, result);
        } catch (error) {
            if (storeLocation === "context") api.addToContext(contextKey, { error: error.message }, "simple");
            else api.addToInput(inputKey, { error: error.message });
        }
    }
});
```

#### Child / branch nodes
When a node branches (e.g. found / not-found), the parent declares its children and the child nodes bind to it:
- Parent: `dependencies: { children: ["onFound", "onNotFound"] }`, and routes with `childConfigs.find(c => c.type === "onFound")` + `api.setNextNode(child.id)`.
- Child: `createNodeDescriptor({ type: "onFound", parentType: "<parentType>", defaultLabel, constraints: {...}, appearance: {...} })`.
- Every child `type` must be listed in the parent's `dependencies.children` AND registered in `module.ts`.

### E. Connection files (`IConnectionSchema`)
Only needed when the extension authenticates. Each:
```ts
import { IConnectionSchema } from "@cognigy/extension-tools";

export const thingAPIKeyConnection: IConnectionSchema = {
    type: "thing-apikey",                 // must match the node field's params.connectionType
    label: "Thing API Key",
    fields: [
        { fieldName: "key" }
    ]
};
```
- The `type` MUST match the `connectionType` referenced by node connection fields.
- Each `fieldName` should correspond to a property the node reads off `config.connection`.

## Output format

Report per file/area. Be concrete and reference real keys/lines. For each problem:
1. **What's wrong** — one plain sentence.
2. **Why it matters** — the consequence (e.g. "the form renders an empty section", "the node won't load").
3. **Fix** — a short corrected snippet.

Use this layout:

```
## Validation: extensions/<name>

### ❌ Problems found

1. src/nodes/getStreetsByCity.ts — `form` references section "storage" that is not defined.
   Why: the editor tries to render a section that doesn't exist, so the field group is dropped.
   Fix: either add a `sections` entry for "storage" listing those field keys, or change the
   form to reference the fields directly:
       form: [
           { type: "field", key: "cityName" },
           { type: "section", key: "storage" }   // <- needs a matching sections[] entry
       ]
       sections: [
           { key: "storage", label: "Storage Option", defaultCollapsed: true,
             fields: ["storeLocation", "inputKey", "contextKey"] }
       ]

2. package.json — missing "lint" script.
   Why: `npm run build` chains lint and will fail.
   Fix: add  "lint": "tslint -c tslint.json src/**/*.ts"

### ✅ Passed
- src/module.ts registers all nodes and connections correctly.
- icon.png and README.md present.

### Verdict
Not ready for PR — 2 issue(s) to fix. (or: Ready for PR — structure conforms.)
```

Keep the tone helpful and specific. Always end with a clear **Verdict** line stating whether the extension is ready for a pull request.
