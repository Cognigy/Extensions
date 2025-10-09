# Signal CXone

This extension is a custom Cognigy extension that allows you to send signals to the CXone API to either escalate a conversation to an agent or end the conversation. It handles authentication by first retrieving a CXone bearer token using your credentials, then performing the desired action via the CXone API. Additionally, for voice interactions, it can post the transcript of the conversation to the Transcript Management System (TMS), if "Get Transcript" tool node is placed above this extension in a flow.

## Features

Sends a signal to CXone API to:

Escalate the conversation to a live agent

End the conversation

Posts voice conversation transcripts to TMS (Transcript Management System)

Voice: The OnSignal Studio action will receive the signal with an "Escalate" or "End" parameter.

Chat: Studio will make the decision based on the returned data.

Returns data: {"Intent":"Escalate"} or {"Intent":"End"}, which CXone Studio can use to either escalate to an agent or end the conversation in Chat, based on the customPayloadFromBot.scriptPayloads property in Studio.

### Node: Send Signal

Function: sendSignalNode

Usage: Use this node in your flow to interact with CXone via API.

**Parameters**:

Parameter	Description
action	"Escalate" or "End" – determines the action to take.
contactId	Master Contact Id from Studio.
businessNumber	CXone Business Unit Number.
optionalParams	Optional additional parameters to include in the signal, provided as an array of strings.
connection	CXone API connection credentials (username, password, basic token).

**Behavior**:

Sends the selected signal (Escalate or End) to the CXone API for the given contact.

If the interaction is voice-based and a transcript is available, posts the transcript to TMS using a standard payload structure (transformConversation function is used to build the TMS payload).

Returns a JSON response for Studio with the action intent ({"Intent": "Escalate"} or {"Intent": "End"}).