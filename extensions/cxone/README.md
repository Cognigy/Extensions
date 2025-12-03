# CXone Extensions 🚀

This collection of Cognigy nodes integrates with **CXone**, enabling transcript posting, live agent transfers, and knowledge retrieval for voice and chat in your Cognigy flows.

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

For **voice interactions**, it also posts the conversation transcript to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this node in the flow.

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

## Signal Interaction ⚡

The **Signal Interaction** node allows you to send custom signals to the **CXone API** using parameters of your choice.

### 🧩 Features

- Handles authentication by obtaining a **CXone bearer token** via your connection credentials
- Sends a signal request to the **CXone API** with the configured parameters
- Parameters are automatically named `p1`, `p2`, `p3`, etc., according to their order in the configuration

- **Return data** to Studio: `{"Intent":"Signal", "Params":"p1|p2|p3"}`
  - The returned data can be accessed in Studio at: `customPayloadFromBot.scriptPayloads`

---

## Knowledge Hub 📚

The **Knowledge Hub** node allows you to query the **CXone Knowledge Hub** in real-time and retrieve answers based on user input.

### 🧩 Features

- Query CXone Knowledge Hub with user utterances
- Maintain conversational context using `context.contextRefId` property
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
  - **POST/PUT/PATCH/DELETE**: optional JSON body is supported  
- Allows specifying **additional HTTP headers** (merged with the `Authorization: Bearer <token>` and `Content-Type application/json` headers automatically)  

### ⚙️ Usage Example

1. Select a **CXone connection** and an **environment**  
2. Specify the **API suffix** (path or query string) to append to the environment's base URL  
3. Choose the **HTTP method**  
4. Optionally provide **additional headers** and/or a **JSON body**  
5. Execute the node and access the results via **context** or **input**  

---

## Testing ✅

This extension uses **Jest** for unit tests.

- **Run all tests**: `npm test`
- The suite covers:
  - Node descriptors in `src/nodes` (e.g. `handover.ts`, `send-signal.ts`) including success and error paths
  - Helpers in `src/helpers` (all HTTP helpers and `tms-payload.ts`) to verify request formats and error handling
- Jest is configured with coverage thresholds targeting near-100% coverage for helper modules.