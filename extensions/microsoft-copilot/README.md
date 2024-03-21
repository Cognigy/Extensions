# Microsoft Copilot

Discover a groundbreaking synergy between human creativity and AI intelligence with the [Microsoft Copilot](https://www.microsoft.com/en/microsoft-copilot) Extension for Cognigy.AI, empowering you to redefine conversational AI development and innovation like never before.

## Connection

This Extension requires a a configured ["Direct Line"](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels?tabs=web#configure-channels) channel within the Microsoft Copilot Studio. Furthermore, make sure that under ["Security" -> "Authentication"](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication#choose-an-authentication-option), there is "No Authentication" selected. Afterward, please click on the created "Direct Line" channel and copy the "Token Enpdoint" url which is required for the connection.

- Direct Line Token Endpoint

## Node: Run Copilot

This Flow Node executes the connected Microsoft Copilot by sending a text message. It waits for the answer and outputs it directly to the user. Furthermore, the `text` and `conversationId` are stored in the input or context object based on the selected storage location:

```json
{
  "copilot": {
    "conversationId": "...-eu",
    "text": "What is Copilot?"
  }
}
```
