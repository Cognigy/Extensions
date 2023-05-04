# German Street Finder

This extension gives a list of German streets based on the postcode (PLZ) and return them as an array. 
The purpose of this extenion is to deliver a basis for fuzzy matching/context hints when getting a users address. 

## Node: Get Streets

This node lets you get a list of German streets within a certain postcode. 

### **Input Parameters**
- Postcode: The postcode you need streets for.
- Where to Store the Result: The selection, where to store the bearer token (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

[Street icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/street "Street Icons")