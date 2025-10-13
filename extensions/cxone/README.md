# CXone Extensions 🚀

This collection of Cognigy nodes integrates with **CXone** and **NiCEview**, enabling conversation escalation, knowledge retrieval, and context management for voice and chat flows.

---

## CXone Handover ✋

The **CXone Handover** node allows you to send **End** or **Escalate** signals to the **CXone API**, either to end a conversation or escalate it to a live agent.

It handles authentication by retrieving a **CXone bearer token** using your connection credentials, then performs the specified action via the CXone API.

For **voice interactions**, it can also post the conversation transcript to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this node in the flow.

### 🧩 Features

- **Send signals to CXone API**:
  - Escalate a conversation to a live agent
  - End a conversation
- **Post voice conversation transcripts** to **TMS**
- **Studio integration**:
  - **Voice:** OnSignal Studio receives `"Escalate"` or `"End"` signals
  - **Chat:** Studio determines the action based on returned data
- **Return data** to Studio: `{"Intent":"Escalate"}` or `{"Intent":"End"}`

---

## CXone Signal ⚡

The **CXone Signal** node allows you to send custom signals to the **CXone API** using parameters of your choice.

### 🧩 Features

- Handles authentication by obtaining a **CXone bearer token** via your connection credentials
- Sends a signal request to the CXone API with the configured parameters
- Parameters are automatically named `p1`, `p2`, `p3`, etc., according to their order in the configuration

---

## Knowledge Hub 📚

The **Knowledge Hub** node allows you to query the **CXone Knowledge Hub** in real-time and retrieve answers based on user input.

### 🧩 Features

- Query CXone Knowledge Hub with user utterances
- Maintain conversational context using `context.contextRefId` property
- Store Knowledge Hub responses in **context** or **input**
- Return textual answers along with associated **links, citations, and images**

---

## NiCEview Context 🖥️

The **NiCEview Context** node sets **NiCEview parameters** in Cognigy context for all channels.  
The data is stored in: `context.data`.

---