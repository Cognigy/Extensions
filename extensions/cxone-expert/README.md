# CXone Expert  🚀

This Cognigy extension integrates with **CXone Expert**, enabling API calls from your Cognigy flows.

---

## Expert API Caller ✨

The **Expert API Caller** node allows you to make **dynamic API calls** to the **CXone Expert platform**, handling authentication using a **Server API Token**.

It generates a **time-sensitive token signature** for the specified user, then sends requests to Expert APIs securely.

### 🧩 Features

- **Dynamic API calls** to Expert SEEK endpoints
- **Authentication handled automatically**:
  - Generates server API token signature: `tkn_{key}_{epoch}_{user}_{hash}`
  - Trades signature for Auth Token session cookie if needed
- **Studio integration**:
  - Returned API payloads can be stored in **Context** or **Input**
- **Custom headers and request body** supported
- **Error handling**: API errors are logged and returned to Studio
- **Caching**: Optional caching of server API tokens for repeated calls within 5 minutes

---

## Usage

1. **Create a connection** using your **Server API Token Key and Secret**.
2. **Add the API Caller node** to your flow.
3. **Configure endpoint, method, headers, and body**.
4. **Store the API response** in the Context or Input for further flow logic.

---

### ⚡ Notes

- The server API token signature is **valid only for a few minutes**; a new token is generated for each API call.
- This extension can be used for knowledge retrieval, and custom Expert integrations.