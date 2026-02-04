# NiCE Channel Extension 🚀

This collection of Cognigy nodes lets you seamlessly include NiCE channel behavior in your Cognigy flows.

---

## Adaptive Card Node ✋

The **Adaptive Card** node allows you to send **custom Adaptive Cards** in digital channels.  
It works in **Cognigy Webchat**, and **CXone Guide Chat** (mimicking the **NiCE channel** experience).

For **Voice Interactions**, it announces a fallback **Voice Channel Announcement** instead of the card.

### 🧩 Features

- **Show Adaptive Cards** in digital channels (Webchat, CXone Guide Chat)
- **Voice fallback**: Displays a text message when the interaction is a voice channel
- **CXone Studio integration**: 
    Returns the Adaptive Card payload tailored for the NiCE CXone channel integration:
    ```json
    {
        "_cognigy": {
            "_niceCXOne": {
                "json": {
                    "text": "",
                    "uiComponent": {
                    "type": "AdaptiveCard",
                    "version": "1.5",
                    "body": [ /* card body */ ],
                    "actions": [ /* card actions */ ]
                    },
                    "data": {},
                    "action": "ADAPTIVE_CARD"
                }
            }
        }
    }
    ```
- **Cognigy Webchat integration**:
    Returns the Adaptive Card payload embedded within the standard Cognigy Webchat format:
    ```json
    {
    "type": "adaptiveCard",
        "_cognigy": {
            "_default": {
            "_adaptiveCard": {
                "type": "adaptiveCard",
                "adaptiveCard": { /* Your Adaptive Card JSON */ }
            }
            }
        }
    }
    ```
- For **Voice Channel**, returns a simple message string instead of an Adaptive Card

### 📌 Notes

- This node allows you to **reuse a single Adaptive Card** across **multiple channels** without changing the flow logic, maintaining consistent behavior in **Webchat, and CXone Guide Chat**.
- Users can enter **standard Adaptive Card JSON** into **Adaptive Card Code**, which will render correctly in supported digital channels.
- The node automatically handles **NiCE-channel behavior**, making Adaptive Cards work seamlessly across multiple channels.
- In voice channel, the card is ignored and the voice fallback message is returned instead.

---