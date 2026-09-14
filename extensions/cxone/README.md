# CXone Extensions 🚀

This collection of Cognigy nodes integrates with **CXone**, enabling transcript posting, live agent transfers, and knowledge retrieval for voice and chat in your Cognigy flows.

---

## Error handling & logging 🔒

Common behavior across all nodes in this extension:

- **Configuration errors** (missing connection, missing required field, invalid JSON in a `json` field) throw immediately, before any CXone call is made, with a message naming the field. They are reported to the flow only — never sent to the customer.
- **Runtime errors** are written to the Cognigy log and to the context; the channel only ever receives the generic `"Something is not working. Please retry."`. Internal details (URLs, HTTP status, API response bodies) are deliberately kept out of the outgoing message payload.
- **Customer data is kept out of the logs**: the transcript posted to TMS is logged with each `messageBody` replaced by `<redacted: N chars>`, the Knowledge Hub logs the size of an utterance rather than its text, the caller's phone number (`ani`) is redacted from the Context Init log, and the CXone API Caller logs only the size of a response, since the body itself is stored under your Output Store Key. Every value still reaches the context and CXone unchanged - only the log line is redacted. Bearer tokens and connection secrets are never logged.
- The CXone bearer token is cached in the context **encrypted** (AES-256-CBC, key derived from the connection's access key) and refreshed after 50 minutes. If CXone rejects a token earlier than that (`401`/`403`), the node drops the cached token, requests a new one and **retries the call once** — so a tenant with shorter lived tokens does not cause failures.
- Cached tokens and discovery URLs are tied to the environment, tenant and connection they came from, so a flow that talks to **more than one CXone environment or tenant** never reuses the wrong endpoint or token.
- **Contact fields come pre-filled**: every node's `Contact ID` / `Main Contact ID` defaults to `{{context.data.contactId}}` and `Spawned Contact ID` to `{{context.data.spawnedContactId}}`, which is exactly what **Context Init** puts there — so in a normal flow you only pick the connection and the action.
- **Environment Base URL** is only shown when Environment is `Other`, and is deliberately empty: it must be your own environment, so nothing is pre-filled for you.

---

## Context Init 🛠️

The **Context Init** node initializes **CXone Studio settings** in Cognigy **context** for both **Voice** and **Chat** interactions. It parses SIP headers (in Voice channel) or input data (in Chat channel) and stores the data in the Cognigy context.  

If required CXone data is missing, the node populates `context.data` with **default values** and **fallback values** (provided via node configuration) to ensure downstream nodes can safely access CXone-related information.

### 🧩 Features

- **Voice channel**:
  - Reads CXone headers from the SIP payload:
    - `X-CXone` → standard CXone data  
    - `X-CXone-Custom` → custom IVA JSON (`ivaParams`)  
    - `X-CXone-Extended` → extended CXone data  
    - `X-InContact-MasterId` → main contact ID  
    - `X-InContact-ContactId` → spawned contact ID  
  - Parses JSON data safely and merges it into a single **context object**  
  - Adds `flowChannel: "VOICE"` flag to indicate voice interactions  
  - Stores all parsed data in Cognigy context under `data`  

- **Chat channel**:
  - Reads CXone parameters from `input.data`  
  - Parses `ivaParams` if present and stores it in Cognigy context  
  - Adds all parsed data in Cognigy context under `data`

- **Fallback and defaults**:
  - If input data or headers are missing, the node populates `context.data` with defaults:
    - `contactId`, `invocationId`, `spawnedContactId` set to placeholder values  
    - Optional fields (`customerName`, `flowId`, `ivaParams`, `ocpSessionId`) populated from **fallback values** provided in node configuration  

### ⚙️ Usage

1. Place **Context Init** at the beginning of your flow.  
2. The node automatically populates `context.data` with CXone-related parameters, either from Voice headers, Chat input, or fallback defaults.  
3. Downstream nodes (like **Exit Interaction** or **Knowledge Hub**) can use `context.data` for CXone API calls or conditional logic.

---

# Exit Interaction ✋

The **Exit Interaction** node allows you to send **End** or **Escalate** signals to the **CXone API** in the Voice channel (either to end a conversation or escalate it to a live agent), or to send a structured data message to Studio in the CXone Guide Chat channel via TextBotExchange.

For **voice interactions**, it also posts the conversation transcript to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this node in the flow — unless a **Send Transcript to TMS** node already posted it earlier in the conversation (see **Duplicate protection**).

The node **waits for 5 seconds before returning control** to the Cognigy flow to avoid unwanted messages or interference during the handover process.

### 🧩 Features

- **Send signals to CXone API in Voice channel**:
  - Escalate a conversation to a live agent
  - End a conversation
- **Post conversation transcripts in Voice channel** to **TMS** (if a transcript is available)
- **Return `Intent` (`Escalate` or `End`) in CXone Guide Chat channel** to Studio at: `customPayloadFromBot.scriptPayloads[1].Intent`
- **Trigger `ReturnControlToScript` in TextBotExchange** in CXone Guide Chat channel
- **Handle optional parameters**:
  - Optional parameters can be provided as an array of JSON objects:
    - In **voice interactions**, these are sent as P2 in the signal
    - In **NiCE Guide Chat**, these are returned to Studio at: `customPayloadFromBot.scriptPayloads[1].Params` as a serialized JSON string

### 📡 Channel Behavior

- **Voice**
  - Signal is sent to CXone Studio
  - **Exit Action** becomes P1
  - **Optional parameters** become P2
  - Transcript is optionally sent to TMS
  - No output is returned from the node
- **NiCE Guide Chat**
  - Returns a structured object to Studio in the following format (representing NiCE channel):

    ```json
    {
      "_cognigy": {
        "_niceCXOne": {
          "json": {
            "text": "",
            "uiComponent": {},
            "data": {
              "Intent": "Escalate",
              "Params": "[{\"key\":\"value\"}]" // optional, only if provided
            },
            "action": "AGENT_TRANSFER" // "END_CONVERSATION" if Exit Action is "End"
          }
        }
      }
    }
    ```

- **Webchat / Testchat**
  - Does not signal or return any data

---

## Send Transcript to TMS 📝

The **Send Transcript to TMS** node posts the conversation transcript to the **CXone Transcript Management System (TMS)** on its own, without signalling CXone. Use it when the transcript has to be published at a point in the flow other than the exit, or in flows that never reach **Exit Interaction**.

It performs exactly the same TMS post as **Exit Interaction**, and the two nodes coordinate through a context flag so a transcript is never posted twice (see **Duplicate protection** below).

### 🧩 Features

- Reads the transcript from `input.transcript`, falling back to `context.transcript`
- Transforms it into the TMS payload (bot outputs → `Bot`, user inputs → `Patron`) and POSTs it to `{apiEndpoint}/aai/tms/transcripts/post`
- **Only messages that carry text are posted.** A data-only message (custom payload, quick replies, an event) would otherwise appear as a blank line in the CXone transcript, so it is skipped; `messageBody` is always sent as a string, so a rich payload in `payload.text` is serialized rather than sent as an object (which TMS rejects). Items with no payload or an unusable timestamp are ignored, and the log states how many were skipped
- **Session Completion** controls the reported outcome: `End Conversation` → `CONTAINED`, `Escalate to Agent` → `ESCALATED`
- Reuses the same **CXone Connection** and the cached token / discovery URLs as every other node in this extension
- Never throws on a TMS failure, so a reporting problem cannot break the flow

### ⚙️ Fields

| Field                 | Description                                                                                                                    |
|:----------------------|:-------------------------------------------------------------------------------------------------------------------------------|
| Environment           | CXone environment (Global Production, FedRAMP Moderate, Australian Sovereign, EU Sovereign, or Other)                          |
| Environment Base URL  | Base URL (Issuer) — only shown when **Environment** is `Other`                                                                  |
| Session Completion    | `Escalate to Agent` → `ESCALATED`, `End Conversation` → `CONTAINED`                                                             |
| Media Type            | How CXone records the interaction. **Auto** (default) reports a voice channel as `Voice` and every other channel as `Digital`; pick `Voice` or `Digital` to force it |
| Business Unit Number  | CXone Business Unit Number (`busId` in the payload) — defaults to `4597359`                                                      |
| Main Contact ID       | CXone Main Contact ID (`contactId` in the payload) — defaults to `{{context.data.contactId}}` as set by **Context Init**         |
| CXone Connection      | The CXone connection to use                                                                                                     |

The transcript is **not** a node field: place Cognigy's **Get Transcript** node above this node so `input.transcript` is populated.

### 🛡️ Duplicate protection

Both this node and **Exit Interaction** read and write a flag at the root of the Cognigy context:

```
context.cxoneTmsTranscriptPostedStatus     // "posted" | "failed" | "skipped"
context.cxoneTmsTranscriptPostedDetails    // human readable details of the last attempt
context.cxoneTmsTranscriptPostedContactId  // the contact the transcript was posted for
```

- On a successful post the status is set to `posted`, together with the contact it was posted for
- Any later TMS post **for that same contact** — from this node or from **Exit Interaction** — is skipped. A session that handles more than one CXone contact still posts a transcript for each of them
- `failed` and `skipped` do **not** block a later attempt, so a transient TMS error can still be recovered by the exit node
- The status is set to `skipped` when there is nothing worth posting: no transcript available, an empty transcript, a transcript with no messages that carry text, or the Testchat placeholder contact (`100000000000`)

---

## Signal Interaction ⚡

The **Signal Interaction** node allows you to send custom signals to the **CXone API** using parameters of your choice.

### 🧩 Features

- Handles authentication by obtaining a **CXone bearer token** via your connection credentials
- Sends a signal request to the **CXone API** with the configured parameters
- Parameters are automatically named `p1`, `p2`, `p3`, etc., according to their order in the configuration
- **Signal Parameters** accepts a JSON array or a JSON string (e.g. `{{context.myParams}}`); non-string values are serialized before being sent

- **Return data** to Studio: `{"Intent":"Signal", "Params":"p1|p2|p3"}`
  - The returned data can be accessed in Studio at: `customPayloadFromBot.scriptPayloads`

---

## Knowledge Hub 📚

The **Knowledge Hub** node allows you to query the **CXone Knowledge Hub** in real-time and retrieve answers based on user input.

### 🧩 Features

- Query CXone Knowledge Hub with user utterances
- Maintain conversational context using the `context.contextRefId` property, which is persisted across turns
- **Filters** accepts a JSON object or a JSON string (e.g. `{{context.myFilters}}`)
- Store Knowledge Hub responses in **context** or **input**
- Return textual answers along with associated **links, citations, and images**

---

## CXone API Caller 🌐

The **CXone API Caller** node allows you to call **any API dynamically** using your CXone connection. You can configure the HTTP method, endpoint, headers, and request body, while the node automatically handles **CXone authentication**.

### 🧩 Features

- Handles authentication by obtaining a **CXone bearer token** via your connection credentials  
- Allows you to call any API endpoint dynamically using the configured **environment** and **API suffix**  
- Supports all HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`  
  - **GET requests**: parameters should be included in the query string (body is ignored)
  - **POST/PUT/PATCH/DELETE**: the JSON body is **optional** — leave the field empty to send the request without a body, or set it to `{}` to send an empty JSON object  
- Allows specifying **additional HTTP headers** (merged with the automatic `Authorization: Bearer <token>` and `Content-Type: application/json` headers — your own value for either of those two wins, which lets you call an endpoint that needs different credentials)
  - **Additional Headers** and **Request Body** accept either a JSON object or a JSON string — both are parsed
  - Header values that are not strings (numbers, nested objects) are serialized before being sent
- **Checking the result**: the response body is stored under your **Output Store Key** for every status code, and the HTTP status is always written to `context.CXoneApiCallerStatus` — use it to branch on failures, since an error status does not stop the flow (only a network/transport failure does)  

### ⚙️ Usage Example

1. Select a **CXone connection** and an **environment**  
2. Specify the **API suffix** (path or query string) to append to the environment's base URL  
3. Choose the **HTTP method**  
4. Optionally provide **additional headers** and/or a **JSON body**  
5. Execute the node and access the results via **context** or **input**  

---