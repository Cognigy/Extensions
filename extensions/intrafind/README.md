# Intrafind Document Search Extension

This extension allows you to do document searches via your Intrafind instance. 

### Node: Search Documents

This node can retrieve meta data on documents based on a specific search term determined by the conversational designer. They can also expand this functionality with query filters (for example in order to only search for certain document types etc.) and determine if only certain fields should be returned in the query. This functionality is very important because if we return every field the results might be too large for the Cognigy input object.

**Fields**

- Search URL: The URL of the Intrafind search application. 
- Search Term: The term to search for in the documents.
- List Size: The amount of results to be returned in the list. 
- Specify Fields: Should only specific fields be returned in the results. 
- Filter Queries: Additional fields to add filter queries based to the search. For example, if you only want results from Sharepoint you would add the query '_facet.indexname:Sharepoint'  
- Where to Store the Result: The selection, where to store the list (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)