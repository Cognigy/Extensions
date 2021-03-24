# UiPath Extension

This Extension integrates [UiPath](https://www.uipath.com/) with Cognigy.AI

# Node: Cloud Authentication

This Node obtains a new Bearer token for the UiPath Orchestrator instance. Currently, this node only supports instances within the UiPath Cloud. 

## Configuration Fields

### **UiPath Connection**

- clientId: The client Id required for the REST endpoint
- userKey: The password required to access your REST endpoint

The information can be found in the Admin panel of the UiPaths console under Tenants. 

### **Input Parameters**
- Where to Store the Result: The selection, where to store the bearer token (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

# Node: Get Releases

This Node obtains the information for all releases (processes and their folders) in your tenant. This information is required get the Key and Organization Unit ID required to start a job. 

## Configuration Fields

### **UiPath Connection***
- accountLogicalName: The account name of the the UiPatch Orchestrator Instance.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instance.

The information can be found in the Admin panel of the UiPaths console under Tenants. 

### **UiPath Connection***
 - Access Token: - Access Token: The Bearer token that was obtained with the Node **Cloud Authentication**. This can be added dynamically using Cognigy Script.
- Where to Store the Result: The selection, where to store the bearer token (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

# Node: Add Queue Item
This node adds a new transaction item to the specified queue within the UiPath Orchestrator Instance. 

## Configuration Fields

### **UiPath Instance**

- accountLogicalName: The account name of the the UiPatch Orchestrator Instance.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instance.

The information can be found in the Admin panel of the UiPaths console under Tenants. 


### **Input Parameters**

- Access Token: The Bearer token that was obtained with the Node **Cloud Authentication**. This can be added dynamically using Cognigy Script.
- Organization Unit ID: The Organization Unit ID obtained with the **Get Releases** Node. This can be added dynamically using Cognigy Script.
- Queue Name: The name of the queue in your orchestrator, where the new item should be created.
- Queue Reference: The reference name that should be inserted within the new transaction. This field is optional and can be used to store for example the value `Cognigy` for a better traceability. 
- Transaction Item Priority: This field can be used to set the priority level for the created queue item.
- Transaction Item Specific Content: This field can be used to provide the **JSON** object with the relevant data for the respective queue. It has to look like that:

``` json
{
    "key1": "value1",
    "key2": "value2",
    "key3": "value3",
}
``` 
**Important**: The UiPath Orchestrator does not support nested JSON Objects! If you want to provide nested objects, it is necessary to stringify the object and deserialize it within the respective UiPath Process.

- Where to Store the Result: The selection, where to store the bearer token (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

# Node: Start Job
This node starts a specific job.

## Configuration Fields

### **UiPath Instance**
- accountLogicalName: The account name of the the UiPatch Orchestrator Instnace.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instnace.

### **Input Parameters**
- Access Token: The Bearer token that was obtained with the Node **Cloud Authentication**
- Process Release Key: The ID for the respective process which was retrieved by the **Get Releases** Node. This can be added dynamically using Cognigy Script.
- Organization Unit ID: The Organization Unit ID obtained with the **Get Releases** Node. This can be added dynamically using Cognigy Script.
- Robot IDs: The array that contains a list of robots that should perform the respective process. The object has to look like this:

``` json
{
    "ids": [123456, 234567]
}
``` 
- Where to Store the Result: The selection, where to store the bearer token (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)