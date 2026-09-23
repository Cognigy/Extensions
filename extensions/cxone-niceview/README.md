# NiCEview Extensions 🚀

This collection of **Cognigy nodes** integrates with **NiCEview**, for both **voice** and **chat**, and does two things:

- **Context** — **NiCEview Init** and **NiCEview Fallback** put the demo's settings into `context.data`, so the flow knows which demo it is running.
- **Demo log** — **Report Session** and **Report Session End** record that the demo ran, on which channel and for how long.

The logging pair is optional: add them where you want sessions recorded, leave them out where you don't.

---

## NiCEview Init ⚙️

The **NiCEview Init** node initializes **NiCEview parameters** in the Cognigy context for chat and voice.  
All data is stored in: `context.data`.


Use this node at the **start of your Cognigy dispatcher flow** to set up demo-specific settings, such as `flowId`, `customerName`, and other NiCEview and CXone (e.g. `contactId`) parameters.  
These values are passed automatically when your demo is launched through NiCEview, ensuring the correct flow dispatch via `context.data.flowId`, and branding your demo using `context.data.customerName` and other parameters.

### **Purpose**
- 🧩 Initializes NiCEview demo parameters in Cognigy `context` under the `data` property
- 🧩 Enables dynamic flow routing based on `flowId` 
- 🧩 Should always run first in the dispatcher flow

### **Caller number (ANI) back-fill** ☎️

`context.data.ani` is what lets an unrecognised caller be numbered **Guest 1**, **Guest 2** against a demo (it is hashed, never stored). CXone does not always populate it, and without it every call reads as a plain "Guest".

When a **real telephony contact** arrives with no `ani`, the node fills it in from elsewhere on the input — first `input.data.numberMetaData`, then `oAuthCustomerName` when that holds a number rather than a name. The field it came from is written to `context.aniSource` (`numberMetaData`, `oAuthCustomerName` or `none`), so a wrong number is traceable to a source.

It is deliberately narrow: only VOICE, only a **real telephony contact**, and it never overwrites an `ani` that is already there.

A **WebRTC** demo is left alone — those callers all arrive through the same browser entry point with no number of their own, so there is nothing to recover. WebRTC is recognised the usual way: `flowChannel` contains `WEBRTC`, **or** `flowChannel` contains `VOICE` while `contactId` is the `100000000000` placeholder. That test, and the rest of the channel rules, live in `helpers/channel.ts` (`isWebRtcInteraction`, `classifyChannel`) so every node reads them the same way.

---

## NiCEview Fallback 🛟

The **NiCEview Fallback** node provides a **lightweight backup mechanism** that automatically loads NiCEview demo configuration data when **running flows directly from Cognigy Test Chat**.  
All data is stored in: `context.data`.


When you run a flow directly in the **Cognigy Test Chat**, the dispatcher (and thus **NiCEview Init**) is bypassed — meaning no NiCEview context data is available.  
This node solves that by fetching and applying the proper demo configuration **only if context data is missing**, ensuring your test behaves the same as a live execution.

### **Purpose**
- 🧩 Loads NiCEview configuration during direct test runs  
- 🧩 Doesn't override existing context data  
- 🧩 Safe to keep in all flows — it only activates when needed  

Simply place this node at the **top of your demo flow** (running once, on first time) and configure it to pull settings for your specific demo.

---

## Report Session 📊

The **Report Session** node records the demo session in the NiCEview demo log — one row per session, so the team can see which demos were run, on which channel, and by whom.

It takes no configuration. Drop it into the flow after the context is set and it decides for itself whether the session is worth reporting.

### **Purpose**
- 🧩 Posts the session once per **session**, not once per turn — safe on a path the flow walks repeatedly
- 🧩 Reports telephony, WebRTC, web chat and Guide chat; ignores Test Chat and anything else
- 🧩 Skips the **AI Agent Hub** on browser channels (a real call into the Hub is still reported). The Hub is recognised by a demo name ending in `_ai-agent-hub`
- 🧩 Never breaks the demo it is reporting on — a failed post is recorded, not thrown, and the request gives up after 5 seconds

### **What it writes to the context**

| Key | Meaning |
| --- | --- |
| `sessionReport` | The reported payload, or `null` when the session is not worth reporting |
| `demoLogReported` | `true` once the session has been reported, which is what makes it once-per-session |
| `demoLogStartedAt` | When the report was made, for a later duration |
| `demoLogId` | The id the demo log answered with — use it to update the same row later |
| `demoLogResult` | The service's response body |
| `demoLogStatus` | The HTTP status, or `0` when the service could not be reached |

The caller number (`ani`) and the demo `user_token` are sent to the service but kept out of the Cognigy logs.

---

## Report Session End 🏁

The **Report Session End** node closes the row that **Report Session** opened: how long the session ran, and how it ended.

Place it on the paths where a demo finishes — the exit node, the handover, the goodbye.

It takes no configuration.

### **Purpose**
- 🧩 Measures the session against `context.demoLogStartedAt` and writes `context.demoLogDuration`
- 🧩 Updates the demo log row identified by `context.demoLogId`
- 🧩 Reports how the session ended from `context.demoLogOutcome`, when the flow sets one
- 🧩 Does nothing but record the duration when there is no row to close — a session that was never worth reporting stays unreported
- 🧩 Never breaks the demo it is reporting on

### **What it writes to the context**

| Key | Meaning |
| --- | --- |
| `demoLogDuration` | Session length in seconds — always written, even when there is no row to close |
| `demoLogEndReported` | `true` once the row has been closed, which is what makes it once-per-session |
| `demoLogResultSessionEnd` | The service's response body |
| `demoLogStatusSessionEnd` | The HTTP status, or `0` when the service could not be reached |

A missing start time, or a clock that moved backwards, reads as `0` rather than as a negative or a nonsense duration.

Like **Report Session**, this runs once per session: a session ends once, so a later run leaves the recorded duration alone rather than stretching it by however long the flow kept going. The guard is only set when a row is actually closed — if the report node has not produced an id yet, this node stays ready to close the row later.

---

## Example Usage

### Dispatcher Flow
1. Add **NiCEview Init (⚙️)** node at the beginning.  
2. Use `context.data.flowId` to route to the correct demo flow.  

### Customer Demo Flow
1. Add **NiCEview Fallback (🛟)** node at the top (running once, on first time). It only fills the context when nothing is there, so it does nothing on a live demo.  
2. Add **Report Session (📊)** node after the context is set — this is what creates the demo log row.  
3. Build the rest of your demo logic.  
4. Add **Report Session End (🏁)** node wherever the demo finishes — the exit node, the handover, the goodbye — to record how long it ran.

To record **how** the demo ended, set `context.demoLogOutcome` (e.g. `handover`, `resolved`) anywhere before step 4. Leave it unset and the row still records the duration.

---

## When something goes wrong 🩺

None of these nodes throws into your flow — a failure is reported and the demo carries on. Each node writes its own diagnostic to the context under **its own node type**, so a flow can branch on it:

| Key | Written by |
| --- | --- |
| `setNiCEviewContextInit` | NiCEview Init — no voice payload, no usable input, or an unexpected error |
| `SetNiCEviewContextFallback` | NiCEview Fallback — missing User Token / Demo Name, or a settings-service failure |
| `reportNiCEviewSession` | Report Session — an unexpected error while reporting |
| `reportNiCEviewSessionEnd` | Report Session End — an unexpected error while closing |

The same message also goes to the Cognigy log. For the demo log specifically, `demoLogStatus` / `demoLogStatusSessionEnd` carry the HTTP status (`0` when the service could not be reached) — a failed post is visible without reading the logs.

**Nothing was logged for a session?** That is usually deliberate: Test Chat is never reported, and neither is the AI Agent Hub on a browser channel. `context.sessionReport` is `null` whenever a session was judged not worth reporting, and the log line says which channel it saw.

---

## Building this extension 🔐

*(maintainers only — you do not need this to use the nodes)*

The service endpoints and the demo-log flow key are **not in this repository**. They live in `src/helpers/secrets.local.ts`, which is gitignored and compiled into the built `.tar.gz` — so the extension your team installs has them, and GitHub never does.

On a fresh clone:

```bash
npm install
npm run secrets     # creates src/helpers/secrets.local.ts from secrets.example.ts
# paste the real values into that file - ask a teammate, it is not committed
npm run build       # produces niceview-<version>.tar.gz to upload to Cognigy
```

`transpile`, `verify` and `build` all run the `secrets` step first, so a clone always compiles. Until the real values are pasted in it compiles with `REPLACE-ME` placeholders and the services simply will not answer. When you add a new endpoint or key, add it to **both** `secrets.local.ts` and `secrets.example.ts` — `npm test` fails if they drift apart.

Run `npm run verify` to transpile, lint and run the test suite.

---

### 🧠 Notes
- **NiCEview Init** and **NiCEview Fallback** write to `context.data`; the two reporting nodes only read it.  
- Fallback **does nothing** if the context is already initialized, or if a live interaction is in progress.  
- Both reporting nodes act **once per session**, so they are safe on a path the flow walks repeatedly.  
- Safe for your customer demo and functional demo tests alike.

---