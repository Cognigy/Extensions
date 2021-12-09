# Marvel Comics API Extension

This extensions allows you to integrate calls data from the [Marvel Developer API](https://developer.marvel.com/) into a cognigy flow. In order to use this API you must receive am public and private API key by signing up for a valid Marvel API account.

## Connection: Your API Keys

The connection information for the Marvel API can be found in your [Marvel Developer Account](https://developer.marvel.com/account). Every node needs this information but you only need to add it once. 

- publicKey: The public key of your Marvel API account. 
- privateKey: The private key of your Marvel API account.  

----
### Node: Get List of Characters

This node will retrieve a list of characters who share a name with no further details. This is useful if a name is shared by many characters (for example "Spider-Man") and the detailed results would be too long to add to the context.

This call uses a search which looks for all characters whose name begins with a specified string. For example: 

* Searching for "Spider-Man" will return Spider-Man will return "Spider-Man, Spider-Man (Miles Morales), Spider-Man (2099), etc".
* Searching for "Spider-Man (2099)" will only return "Spider-Man (2099).

**Fields:**

- Character Name: The search string used to look for a characters. Will return all characters whose names begin with that string. 
- Where to Store the Result: The selection, where to store the list (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)


----
### Node: Get Character

This node gets detailed information about a character. As apposed to the "Get List of Characters" Node, this node uses a specific search. This means if you search for "Spider-Man" you will only receive the results with characters sharing that exact name. As another example if you look for "Captain Marvel" you will get no results because all characters with that name in the Marvel API have their real names in parenthesis afterwards in the string. 

You can use the afforementioned "Get List of Characters" in connection with a say node with quick replies in order find a characters specific name in the API und use the "Get Character Node" to find detailed information on that character. 

**Fields:**

- Character Name: The search string used to look for a characters. Will return only one character who has the name exactly as written in the string. 
- Where to Store the Result: The selection, where to store the character details (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

----
### Node: Get Comic by UPC

This node retrieves detailed information on a comic issue using a 17 digit comic UPC search. 

**Fields:**

- Comic UPC: Where to store 
- Where to Store the Result: The selection, where to store the comic details (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

### Node: Get Comic by Name and Issue Number

This node retrieves detailed comic information based on the name of the comic, the issue number, and the year the first issue of the series was published (for example, X-Men (2099) ran for many years but the first issue of the series was published in 1993). If more than one comic shares these criteria (might be the case) mdetails for multiple comics will be returned.

**Fields:**

- Comic Name: The search string for the name of the comic series. Will return all characters whose names begin with that string.
- Comic Number: The issue number of the comic from the series.
- Year of the First Comic in the Series: The year the series started.   
- Where to Store the Result: The selection, where to store the comic details (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

### Node: Get Comic by Comic ID

This node retrieves detailed comic information based on the comic ID from the Marvel comics API. Can best be used in connection with the "Get Comic by Name and Issue" Node if the previous node returns too many results and you only want the results for one comic. 

**Fields:**

- Comic ID: The unique ID of the comic from the API.
- Where to Store the Result: The selection, where to store the comic details (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

### Node: Get Creator

This node retrieves detailed information about specific comic creators by name. 

**Fields:**

- Creator Name: The name of the creator you are looking for.
- Where to Store the Result: The selection, where to store the creator details (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)

### Node: Get Series by Creator ID

This node retrieves detailed information about series in which a creator was involved. Can only search based on creator ID as the Marvel API does not allow series searches be creator name. Because it would retrieve too much data if everything was retrieved, only certain information is returned:

* Title of the series
* Series description
* Image from the series (usually a cover of a comic from the series)
* Fallback URL linking to further information on the Marvel comics Website.

**Fields:**

- Creator ID: The creator ID from the Marvel comics API. 
- Where to Store the Result: The selection, where to store the series information (either in `context` or `input`)
- Input Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `input`)
- Context Key to Store Result: The key name where the value will be stored (Only necessary, when storeLocation equals `context`)