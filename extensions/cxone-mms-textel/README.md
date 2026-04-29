# Textel SMS/MMS 📱

This **Cognigy custom extension** allows you to send **SMS** and **MMS** messages via **Textel** directly from a Cognigy flow. It supports sending text messages and optional media attachments to a phone number.

---

## 🚀 Features

- ✉️ **Send SMS** messages to any valid phone number.  
- 🖼️ **Send MMS** messages with optional media attachment (e.g., an image).  
- 🔑 **Authentication** via Textel API token.  

---

## ⚡ Usage

1. Configure the extension with your **Textel API token**.  
2. Provide the `Sender` and `Recipient` phone numbers.  
3. Add your message text and an optional attachment URL.  
4. Call the node in your Cognigy flow to send the SMS/MMS.  

---

## 📌 Notes

- MMS attachment should comply with **Textel's file size limits** and supported file types.  
- The extension handles a **single attachment**.  

---