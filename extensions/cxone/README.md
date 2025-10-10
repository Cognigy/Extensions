# CXone Handover

This node allows you to send **End** or **Escalate** signals to the **CXone API** to either end a conversation or escalate it to a live agent.  

It handles authentication by retrieving a **CXone bearer token** using your connection credentials, then performing the specified action via the **CXone API**.  

For **voice interactions**, it can also post the conversation transcript to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this extension in the flow.

## Features

- **Send signals to CXone API** to:
  - Escalate a conversation to a live agent
  - End a conversation
- **Post voice conversation transcripts** to **TMS**
- **Studio integration**:
  - **Voice:** OnSignal Studio receives `"Escalate"` or `"End"` signals
  - **Chat:** Studio determines the action based on returned data
- **Return data** to Studio:  

```json
{"Intent":"Escalate"} or {"Intent":"End"}
```

---

# CXone Signal

This node allows you to send signals to the **CXone API** using parameters of your choice.  

The extension handles authentication by obtaining a **CXone bearer token** using your connection credentials, then sends a signal request to the **CXone API** with the specified parameter values.  

Parameters are automatically named as `p1`, `p2`, `p3`, and so on, based on their order in the configuration.


---

# Knowledge Hub

This node allows you to query the **CXone Knowledge Hub** in real-time and retrieve answers based on user input. It supports storing the response in either **context** or **input**, preserves conversational context, and includes relevant links, citations, and images from the Knowledge Hub.

## Features

- **Query CXone Knowledge Hub** with user utterances.
- **Maintain conversational context** using `contextRefId`.
- **Store Knowledge Hub responses** in Cognigy context or input.
- **Return both textual answers and associated links, citations, images** from the Knowledge Hub.

---

## NiCEview Context

This node sets **NiCEview** parameters in Context for all channels.  
The data is stored in `context.data`.

---