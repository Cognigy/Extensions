# Atlassian Confluence

Integrates Cognigy.AI with Confluence (https://www.atlassian.com/software/confluence)

Confluence is a popular collaboration tool that allows teams to work together by writing knowledge articles, how-to's and other guides. By using Confluence in conjunction with Cognigy.AI, it becomes possible to create intelligent bots that can search through your Confluence knowledge base and give detailed instructions. The Confluence Extension provides 2 types of functionalities. Knowledge Connectors and Flow Nodes.

## Table of Contents
- [Connection](#connection)
- [Confluence Knowledge Connectors](#confluence-knowledge-connectors)
- [Confluence Flow Nodes](#confluence-flow-nodes)

---

# Connection

This module needs a CognigySecret to be defined and passed to the connector. A Cognigy Secret can be added to any Cognigy project and allows for the encryption of sensitive data. The secret must have the following keys:
- **domain:** The base URL of your Confluence application i.e, https://xyz.atlassian.net. This field is not required for the Knowledge Connectors
- **username:** Your Confluence account email address bob@sample.com
- **key:** Can be generated within your Confluence account. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.

---
# Confluence Knowledge Connectors

### Knowledge Connector: Page Content Connector
Confluence page content knowledge connector allows you to connect to Confluence and retrieve data from its pages or folders. It adds knowledge sources from the pages retrieved from the confluence. The extension transforms Confluence's HTML output into structured Markdown. This conversion process supports custom transformation rules and plugins, enabling precise handling of Confluence-specific elements such as macros, panels, and structured content blocks.

**Note:** The connector uses the following MIT-licensed libraries: [`Dom Christie@turndown`](https://www.npmjs.com/package/turndown), [`langchain`](https://www.npmjs.com/package/langchain)

#### Heading-Based Chunking
Content is automatically divided into chunks based on the heading hierarchy in Confluence. The chunking behavior will be as follows:
- **H1, H2**: Start new chunks
- **H3, H4, H5, H6**: Included in the current chunk

If a chunk exceeds the default length of 2000 characters, it will be further divided into smaller chunks.

#### Supported Confluence Content Types
- Plain text and formatted text
- Tables
- Bulleted and numbered lists
- Panels (info, warning, error, success)
- Expandable sections
- Task lists
- Alternative text of Images

#### Fields:

**Connection:**
Connection field as defined in [Connection](#connection)

**Confluence URL:**
URL of the Confluence page or folder to be extracted

**Extract Descendants:**
When enabled, extracts content from the specified page and all its descendant pages. When disabled, extracts only the specified page content. This setting applies only to individual page URLs. For folder URLs, all pages within the folder are always extracted.

**Source Tags:**
Sets the tags that you want to associate with each knowledge source

---

# Confluence Flow Nodes

### Node: Search

This function allows Cognigy to search through a specific Confluence workspace based on an input text.  The SearchInput field can be filled with anything ranging from - repeating what the user just said (e.g. {{ci.text}} ) - to specific key phrases.

**Response JSON Structure**

```json
{
  "confluence": {
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
            "value": "<h2>Solution</h2><ac:structured-macro ac:name=\"note\" ac:schema-version=\"1\" ac:macro-id=\"1943ffc0-d5dd-4fc4-8b73-610f6e0b7546\"><ac:rich-text-body><p>PLEASE NOTE: all printers will be replaced by HP DeskJets from August 2019 onwards"
          }
        }
      }
    ]
  }
}
```

**Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat.

### Node: Get All Pages

Returns all pages within a specific Confluence Space. In order to get the result, one needs to get the **Key** of a space. In most cases, this is a three-character identifier, such as COG or GEN. For example, one can find it in the confluence url of a space: `https://domain.atlassian.net/wiki/spaces/   GEN   /overview` -> space = GEN

**Response JSON Structure**

```json
{
  "confluenceResult": [
    {
        "id": "262277",
        "type": "page",
        "status": "current",
        "title": "IT HELP DESK",
        "webLink": "...",
        "htmlBody": "..."
    }
  ]
}
```

 **Please Note** : The response object gives back an array of results. If one or more results have been found, the relevant HTML is also returned. This can be used to render the output in the front-end webchat.