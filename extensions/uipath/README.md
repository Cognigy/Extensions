# UiPath Extension

This Extension integrates [UiPath](https://www.uipath.com/) with Cognigy.AI

# Node: Create Token

This Node obtains a new Bearer token for the UiPath Orchestrator instance. Currently, this node only supports instances within the UiPath Cloud. If you are using a On-Premise Solution it is necessary to remove the `accountLogicalName` and `tenantLogicalName` paths from the endpoints. In addition, you have to implement and use the  On-Premise authentication method.

## Configuration Fields

### **UiPath Connection**

- clientId: The client Id required for the REST endpoint
- refreshToken: The password required to access your REST endpoint

### **Input Parameters**
- storeLocation: The selection, where to store the bearer token
- inputKey: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- contextKey: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)


# Node: Add Transaction
This node adds a new transaction item to the specified queue wihtin the UiPath Orchestrator Instance. 

## Configuration Fields

### **UiPath Instance**
- accountLogicalName: The account name of the the UiPatch Orchestrator Instnace.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instnace.

### **Input Parameters**

- accessToken: The Bearer token that was obtained with the Node **Create Token**
- queueName: The name of the queue, where the new transaction should be created.
- referenceName: The reference name that should be inserted within the new transaction. This field is optional and can be used to store for example the value `Cognigy` for a better traceability. 
- transactionPriority: This field can be used to set the priority level for the created queue item.
- queueData: This field can be used to provide the **JSON** object with the relevant data for the respective process. It has to look like that:

``` json
{
    "key1": "value1",
    "key2": "value2",
    "key3": "value3",
}
``` 
**Important**: The UiPath Orchestrator does not support nested JSON Objects! If you want to provide nested objects, it is necessary to stringify the object and deseralize it within the respective UiPath Process.

- inputKey: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- contextKey: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

# Node: Start Job
This node starts a specific job.

## Configuration Fields

### **UiPath Instance**
- accountLogicalName: The account name of the the UiPatch Orchestrator Instnace.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instnace.
### **Input Parameters**
- accessToken: The Bearer token that was obtained with the Node **Create Token**
- releaseKey: The ID for the respective process.
- robotIds: The array that contains a list of robots that should perform the respective process. The object has to look like that:
``` json
{
    "ids": [123456, 234567]
}
``` 
- inputKey: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- contextKey: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)


# Node: GetOutputInformationSynch
Get the output information for a specified transaction item.

**Important**: This is a blocking implementation, which means, that this fucntion will wait till the transaction item has the status `Successful` or `Failed`. This is only the case, when the robot has processed the transaction item. Please consider that in robot processes that have a long process time, this can lead to an exception within Cognigy, since it can exceed the execution time threshold for extensions. Therefore, this function should only be used for PoC purposes.

## Configuration Fields

### **UiPath Instance**
- accountLogicalName: The account name of the the UiPatch Orchestrator Instnace.
- tenantLogicalName: The tenant name of the the UiPatch Orchestrator Instnace.

### **Input Parameters**
- accessToken: The Bearer token that was obtained with the Node **Create Token**
- releaseKey: The ID for the respective process.
- transactionItemId: The ID of the transaction item that should be checked.
- inputKey: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- contextKey: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)