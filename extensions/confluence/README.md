
# Atlassian Confluence Custom Module

  

Integrates Cognigy.AI with Confluence (https://www.atlassian.com/software/confluence)

Confluence is a popular collaboration tool that allows teams to work together by writing knowledge articles, how-to's and other guides. By using Confluence in conjunction with Cognigy.AI, it becomes possible to create intelligent bots that can search through your Confluence knowledge base and give detailed instructions. This conversational AI can then be released cross-channel. 

  
  
### Secret

This modules needs a CognigySecret to be defined and passed to the Nodes. A Cognigy Secret can be added to any Cognigy project and allows for the encryption of sensitive data. The secret must have the following keys:

  

- baseUrl (e.g. https://test.atlassian.net)

- username (Your Jira account email address bob@sample.com)

- password (Can be generated within your Jira Project. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.)

  ![Define a Confluence Secret ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/1-secret.JPG)

## List of Nodes / Operations

 

- search

- getAllPages

- generateLexicon




## Node: Search Text

This function allows Cognigy to search through a specific Confluence workspace based on an input text.  The SearchInput field can be filled with anything ranging from - repeating what the user just said (e.g. {{ci.text}} ) - to specific key phrases.  
  
![Configure the Search Text Node ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/2-configurejpg.jpg)

  #### Required Input

  

-  **Secret** --> Select the secret that contains username, password and baseUrl.

-  **SearchInput** --> The search query. Can be "whatever the user just said", e.g. {{ ci.text }} as well as an hardcoded value based on key phrases. 
- 
  **WriteToContext** --> Whether to store the API Response under the Cognigy Context or Input Object

-  **Store** --> The name of the result. 

-  **stopOnError** --> Whether to stop or continue on error

  

#### Response JSON Structure

  

```json

"search": {
  "results": [
    {
      "id": "229450",
      "type": "page",
      "status": "current",
      "title": "Printer does not work",
      "macroRenderedOutput": {
        
      },
      "body": {
        "storage": {
          "value": "<h2>Solution</h2><ac:structured-macro ac:name=\"note\" ac:schema-version=\"1\" ac:macro-id=\"1943ffc0-d5dd-4fc4-8b73-610f6e0b7546\"><ac:rich-text-body><p>PLEASE NOTE: all printers will be replaced by HP DeskJets from August 2019 onwards
          
```

 **Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat. 

 
## Node: Get All Pages

Returns all pages within a specific Confluence Space.
  ![Configure the Get All Pages Node ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/3-getallpagesjpg.jpg)

  #### Required Input

  

-  **Secret** --> Select the secret that contains username, password and baseUrl.

-  **ConfluenceSpace** --> The Confluence space you want to return all pages for.
- 
  **WriteToContext** --> Whether to store the API Response under the Cognigy Context or Input Object

-  **Store** --> The name of the result. 

-  **stopOnError** --> Whether to stop or continue on error

  

#### Response JSON Structure

  

```json

"confluenceResult": [
{
    "id": "262277",
    "type": "page",
    "status": "current",
    "title": "IT HELP DESK",
    "webLink": "https://cognigy-test.atlassian.net/wiki/spaces/KNOW/pages/262277",
    "htmlBody": "<ac:layout><ac:layout-section ac:type=\"fixed-width\" 
          
```

 **Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat. 

 
## Node: Generate Lexicon

Returns all labels within a given space and populates a lexicon with these labels. 

 

  #### Required Input

  

-  **Secret** --> Select the secret that contains username, password and baseUrl.

-  **ConfluenceSpace** --> The Confluence space you want to return all pages for.

-  **LexiconId** --> The ID of the lexicon you want to fill.

-  **LexiconTagName** --> The name of the keyphrase tag that is being generated (e.g. device, label or term)

-  **WriteToContext** --> Whether to store the API Response under the Cognigy Context or Input Object

-  **Store** --> The name of the result. 

-  **stopOnError** --> Whether to stop or continue on error

   **Please Note** : This node does NOT create a lexicon by itself. Instead it fills an already existing lexicon with keyphrases. This means that you first need to create a lexicon and copy its ID (see screenshot).

   ![Copy the LexiconId ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/4-generateLexicon.jpg)


  You can then configure the rest of the node (including the lexicon ID).

  ![Configure the Generate Lexicon Node ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/5-generateLexiconNode.jpg)



   **Please Note** : The response JSON shows which labels were found. 


#### Response JSON Structure

  

```json

  "lexiconResult": {
    "status": {
      "message": "Added the following labels with label-tag to lexicon 5d28c74aa20667383ef07d0a",
      "results": [
        "jira",
        "login",
        "account",
        "log-in",
        "logon",
        "printer",
        "driver",
        "deskjet",
        "deskjet404"
      ]
    }
  }
          
```

 

   **Please Note** : The actual result is "added" to the lexicon. Switch back to the lexicon the find it populated. The results are automatically persisted in the lexicon. As, such this node only needs to be executed once (can be done by the developer, does not need to go in production).


![The generated lexicon ](https://tempbucket-waanders.s3.eu-central-1.amazonaws.com/Confluence/6-generateLexiconNode.jpg)