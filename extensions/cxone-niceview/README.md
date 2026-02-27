# NiCEview Extensions 🚀

This collection of **Cognigy nodes** integrates with **NiCEview**, enabling seamless **context management** for both **voice** and **chat** within your Cognigy flows.

---

## NiCEview Init ⚙️

The **NiCEview Init Context** node initializes **NiCEview parameters** in the Cognigy context for chat and voice.  
All data is stored in: `context.data`.


Use this node at the **start of your Cognigy dispatcher flow** to set up demo-specific settings, such as `flowId`, `customerName`, and other NiCEview and CXone (i.e.: `contactId`) parameters.  
These values are passed automatically when your demo is launched through NiCEview, ensuring the correct flow dispatch via `context.data.flowId`, and branding your demo using `context.data.customerName` and other parameters.

### **Purpose**
- 🧩 Initializes NiCEview demo parameters in Cognigy `context` under the `data` property
- 🧩 Enables dynamic flow routing based on `flowId` 
- 🧩 Should always run first in the dispatcher flow

---

## NiCEview Fallback 🛟

The **NiCEview Fallback Context** node provides a **lightweight backup mechanism** that automatically loads NiCEview demo configuration data when **running flows directly from Cognigy Test Chat**.  
All data is stored in: `context.data`.


When you run a flow directly in the **Cognigy Test Chat**, the dispatcher (and thus the Init Context) is bypassed — meaning no NiCEview context data is available.  
This node solves that by fetching and applying the proper demo configuration **only if context data is missing**, ensuring your test behaves the same as a live execution.

### **Purpose**
- 🧩 Loads NiCEview configuration during direct test runs  
- 🧩 Doesn't override existing context data  
- 🧩 Safe to keep in all flows — it only activates when needed  

Simply place this node at the **top of your demo flow** (running once, on first time) and configure it to pull settings for your specific demo.

---

## Example Usage

### Dispatcher Flow
1. Add **NiCEview Init Context (⚙️)** node at the beginning.  
2. Use `context.data.flowId` to route to the correct demo flow.  

### Customer Demo Flow
1. Add **NiCEview Fallback Context (🛟)** node at the top (running once, on first time).  
2. Proceed with the rest of your demo logic — the fallback node will only populate context if missing.

---

### 🧠 Notes
- Both nodes write to `context.data`.  
- Fallback node **does nothing** if context is already initialized.  
- Safe for your customer demo and functinal demo tests alike.

---