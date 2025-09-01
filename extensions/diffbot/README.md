
# Cognigy.AI

This Extension provides basic diffbot connector, that crawl through the pages and create knowledge sources with chunks. It integrates Cognigy.AI with diffBot (https://www.diffbot.com/)

## Table of Contents
- [diffbot Knowledge Connector](#diffbot-knowledge-connectors)
- [diffbot Connection](#diffbot-connection)

---
## Diffbot Knowledge Connectors

The Diffbot Knowledge Connector enables extraction of structured data from web pages in JSON format. This connector automatically creates knowledge sources by crawling specified web pages and processing their content through Diffbot's extraction service.

### Chunking
The JSON content returned by Diffbot is flattened and processed using recursive character splitting to create text chunks. Each chunk is prefixed with the page title, content type, and URL for web page. Knowledge chunks that exceed the default maximum length of 2000 characters are automatically truncated.

### Fields

**Connection:**
Connection field as defined in [Connection](#diffbot-connection)

**Web page URL:**
URL of the Web page

**Web page Type**
Type of content the web page have i.e. Product, List, Job etc. If type is not known then choose 'Other' type, however the accuracy of the result may be affected if 'Other' type is chosen.

**Source Tag:**
Sets the tags that you want to associate with each Knowledge Source

**Note:** The connector uses the following MIT-licensed libraries: [`json-to-plain-text`](https://www.npmjs.com/package/turndown), [`langchain`](https://www.npmjs.com/package/langchain), [`@appveen/json-utils`](https://www.npmjs.com/package/@appveen/json-utils)

# Diffbot Connection

This module needs a CognigySecret to be defined and passed to the Knowledge Connector. A CognigySecret can be added to any Cognigy Project and allows for the encryption of sensitive data. The secret must have the following keys:
- **accessToken:** Access token to access the diffbot api