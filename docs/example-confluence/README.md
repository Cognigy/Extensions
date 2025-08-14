# Example Extension

This is an example Extension that is designed to get you started with Cognigy.AI Knowledge Connector Extensions. Using this extension, you will be able to connect to Confluence and fetch data from its pages or folders.

This extension iterates through the pages and for each page, it searches for headings, and for all the text under each heading it creates knowledege chunks. If a chunk size is greater than 2000 characters, it will break down the chunk into smaller chunks.

**Connection: apiKeyConnection**

Some nodes require a [Connection](https://docs.cognigy.com/docs/connections) that can be used to handle API credentials.

This example Connection only requires you to fill out two fields:
- email
- apiToken

----
**Fields:**

#### Connection
The connection that needs to be configured in order to provide an API key.

#### Confluence URL
URL of the Confluence page or folder

#### Extract Descendants
This field is only relevant if the Confluence URL is of a page. In case it's of a folder, all the pages under the folder are extracted.

#### Source Tags
Sets the tags that you want to associate with each knowledge source
