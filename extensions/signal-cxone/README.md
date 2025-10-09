# Signal CXone

This is a **custom Cognigy extension** that allows you to send signals to the **CXone API** to either escalate a conversation to an agent or end the conversation.  

It handles authentication by retrieving a **CXone bearer token** using your conection credentials, then performing the desired action via the **CXone API**.  

For **voice interactions**, it can also post the transcript of the conversation to the **Transcript Management System (TMS)** if the **"Get Transcript"** node is placed above this extension in a flow.

---

## Features

- **Send signals to CXone API** to:
  - Escalate a conversation to a live agent
  - End a conversation
- **Post voice conversation transcripts** to **TMS**
- **Studio integration**:
  - **Voice:** OnSignal Studio receives `"Escalate"` or `"End"` signals
  - **Chat:** Studio decides based on returned data
- **Return data** to Studio:  {"Intent":"Escalate"} or {"Intent":"End"}


Studio can use this to escalate to an agent or end the conversation in Chat, using the **`customPayloadFromBot.scriptPayloads`** property.

---

## Node: Send Signal

**Function:** `sendSignalNode`  

Use this node in your flow to interact with **CXone** via API.

### Parameters

| Parameter        | Description                                                                                   |
|------------------|-----------------------------------------------------------------------------------------------|
| `action`         | `"Escalate"` or `"End"` – determines the action to take                                       |
| `contactId`      | Master Contact Id from Studio                                                                 |
| `businessNumber` | CXone Business Unit Number                                                                    |
| `optionalParams` | Optional additional parameters to include in the signal (array of strings)                    |
| `connection`     | CXone API connection credentials (`username`, `password`, `basic token`)                      |

### Behavior

- Sends the selected signal (`Escalate` or `End`) to the **CXone API** for the given contact
- If the interaction is **voice-based** and a transcript is available:
  - Posts the transcript to **TMS** using a standard payload
  - Uses the `transformConversation` function to build the TMS payload
- Returns a **JSON response** for Studio: {"Intent": "Escalate"} or {"Intent": "End"}