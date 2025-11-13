# CXone Extensions 🚀

This collection of Cognigy nodes integrates with **CXone**, enabling transcript posting, live agent transfers, and knowledge retrieval for voice and chat in your Cognigy flows.

---

## Exit Interaction ✋

The **Exit Interaction** node allows you to send **End** or **Escalate** signals to the **CXone API**, either to end a conversation or escalate it to a live agent.

It handles authentication by retrieving a **CXone bearer token** using your connection credentials, then performs the specified action via the CXone API.

For **voice interactions**, it can also post the conversation transcript to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this node in the flow.

### 🧩 Features

- **Post voice conversation transcripts** to **TMS**
- **Send signals to CXone API**:
  - Escalate a conversation to a live agent
  - End a conversation
- **Studio integration**:
  - **Voice:** OnSignal Studio Action receives `"Escalate"` or `"End"` signals as the P1 parameter
    - **Optional Parameters:** If optional parameters are specified, they will be included in the signal as P2, P3, and subsequent parameters
  - **Chat:** Studio determines the action based on returned data
    - **Return data** to Studio: `{"Intent":"Escalate"}` or `{"Intent":"End"}`
    - The returned data can be accessed in Studio at: `customPayloadFromBot.scriptPayloads`
    - **Optional Parameters:** If optional parameters are specified, they will be included in the returned data as pipe-separated values, for example: `{"Intent":"Escalate", "Params":"p1|p2|p3"}`

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