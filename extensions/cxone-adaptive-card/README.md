# Adaptive Card Extension

Cognigy extension for sending and capturing **Adaptive Cards** across CXone Guide Chat, Cognigy Webchat, Voice, and SMS/WhatsApp channels.

---

## Nodes

### Show Adaptive Card

Sends an Adaptive Card to the user. Automatically formats output for the active channel — no flow branching needed.

| Channel | Behaviour |
|---|---|
| CXone Guide Chat | Sends card via `_cognigy._niceCXOne` envelope with `action: "ADAPTIVE_CARD"` |
| Cognigy Webchat | Sends card via `_cognigy._default._adaptiveCard` envelope |
| Voice / SMS / WhatsApp | Sends the plain-text **Voice, SMS, WhatsApp Channel Announcement** fallback |

Channel is detected from `input.channel` first, then `input.data.flowChannel` / `context.data.flowChannel` as a fallback.

#### Fields

| Field | Description |
|---|---|
| **Voice, SMS, WhatsApp Channel Announcement or Question** | Text announced or asked in Voice, SMS, and WhatsApp channels |
| **Adaptive Card Code** | Standard Adaptive Card JSON (version 1.5) |
| **Wait for Input** | If enabled, the flow pauses after sending the card and waits for the user to submit it. Place a **Capture Adaptive Card** node immediately after. |

---

### Capture Adaptive Card

Reads the user's answer from input and stores it in context or input. Place directly after **Show Adaptive Card** with **Wait for Input** enabled.

| Channel | Answer read from | Stored as |
|---|---|---|
| CXone Guide Chat | `input.data.adaptiveCardAnswer` (configurable) | Object (`acData` extracted if present) |
| Cognigy Webchat | `input.data.adaptivecards` | Object |
| Voice / SMS | `input.text` | String at `<storeKey>.text` |

#### Fields

| Field | Description |
|---|---|
| **Guide Chat Answer Path** | Dot-notation path to the answer in CXone Guide Chat (default: `input.data.adaptiveCardAnswer`). Not used for Webchat or Voice/SMS. |
| **Output Store Location** | Where to store the answer — **Context** (persists across turns, default) or **Input** (current turn only) |
| **Output Store Key** | Dot-notation path to write the answer to (default: `data.adaptiveCardAnswer`). For Voice/SMS, text is stored at this path + `.text`. |

#### Recommended flow

```
Show Adaptive Card (Wait for Input: ON)  →  Capture Adaptive Card  →  (your next nodes)
```

After Capture, the answer is available at `context.data.adaptiveCardAnswer` (or wherever you configured the store key).
