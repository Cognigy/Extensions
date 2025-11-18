# NiCE Channel Extension 🚀

This collection of Cognigy nodes lets you seamlessly include NiCE channel behavior in your Cognigy flows.

---

## Adaptive Card Node ✋

The **Adaptive Card** node allows you to send **custom Adaptive Cards** in digital channels.  
It works in **Cognigy Webchat**, **CXone Guide Chat**, and **NiCE channel**, mimicking the NiCE experience.

For **voice interactions**, it announces a fallback **voice message** instead of the card.

### 🧩 Features

- **Send Adaptive Cards** in digital channels (Webchat, CXone Guide Chat)
- **Voice fallback**: Displays a text message when the interaction is a voice channel
- **Studio integration**: 
  - Returns data to Studio as `uiComponent` for CXone Guide Chat:
    ```json
    {
      "uiComponent": {
        "type": "AdaptiveCard",
        "version": "1.5",
        "body": [...],
        "actions": [...]
      }
    }
    ```
  - For voice channels, returns a simple message string instead of an Adaptive Card

### 📌 Notes

- This node allows you to **reuse a single Adaptive Card** across **multiple channels** without changing the flow logic, maintaining consistent behavior in **Webchat, and CXone Guide Chat**.
- Users can enter **standard Adaptive Card JSON** into `cardCode`, which will render correctly in supported digital channels.
- The node automatically handles **NiCE-channel behavior**, making Adaptive Cards work seamlessly across multiple channels.
- In voice channel, the card is ignored and the voice fallback message is returned instead.

---