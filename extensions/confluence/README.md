# Atlassian Confluence

Integrates Cognigy.AI with Confluence (https://www.atlassian.com/software/confluence)

Confluence is a popular collaboration tool that allows teams to work together by writing knowledge articles, how-to's, and other guides. By integrating Confluence with Cognigy.AI, you can create Cognigy AI Agents that can search through your Confluence knowledge base and provide users with context-aware responses. The Confluence Extension provides [Knowledge Connectors](#confluence-knowledge-connectors) and [Flow Nodes](#confluence-flow-nodes).

## Table of Contents
- [Confluence Knowledge Connectors](#confluence-knowledge-connectors)
- [Confluence Flow Nodes](#confluence-flow-nodes)
- [Confluence Connection](#confluence-connection)

---
## Confluence Knowledge Connectors

The Confluence Knowledge Connector allows you to connect to Confluence and retrieve data from its pages or folders. This Knowledge Connector adds Knowledge Sources based on the pages retrieved from Confluence. The Extension transforms Confluence's HTML output into structured Markdown. This conversion process supports custom transformation rules and plugins, enabling precise handling of Confluence-specific elements such as macros, panels, and structured content blocks.

### Heading-Based Chunking

Content is automatically divided into chunks based on the heading hierarchy in Confluence. The chunking behavior is the following:
- **H1, H2**: Start new chunks
- **H3, H4, H5, H6**: Included in the current chunk

If a chunk exceeds the default length of 2000 characters, it will be further divided into smaller chunks.

### Supported Confluence Content Types

- Plain and formatted text
- Tables
- Bulleted and numbered lists
- Panels (info, warning, error, success)
- Expandable sections
- Task lists
- Alternative text of images

### Fields

**Connection:**
Connection field as defined in [Connection](#confluence-connection)

**Confluence URL:**
URL of the Confluence page or folder to be extracted

**Extract Descendants:**
When enabled, extracts content from the specified page and all its descendant pages. When disabled, extracts only the specified page content. This setting applies only to individual page URLs. For folder URLs, all pages within the folder are always extracted.

**Source Tags:**
Sets the tags that you want to associate with each Knowledge Source

**Note:** The connector uses the following MIT-licensed libraries: [`turndown`](https://www.npmjs.com/package/turndown), [`langchain`](https://www.npmjs.com/package/langchain)

---

## Confluence Flow Nodes

### Node: Search

This Node allows Cognigy to search through a specific Confluence workspace based on an input text. The `SearchInput` field can be filled with anything ranging from repeating what the user just said (e.g. {{ci.text}} ) to specific key phrases.

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

This Node returns all pages within a specific Confluence space. In order to get the result, you need to have the key of a space. In most cases, this is a three-character identifier, such as COG or GEN. For example, you can find the key in the Confluence URL of a space: `https://domain.atlassian.net/wiki/spaces/   GEN   /overview` -> key = GEN

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

---

# Confluence Connection

This module needs a CognigySecret to be defined and passed to the connector. A CognigySecret can be added to any Cognigy Project and allows for the encryption of sensitive data. The secret must have the following keys:
- **domain:** The base URL of your Confluence application i.e, https://xyz.atlassian.net. This field is not required for the Knowledge Connectors
- **username:** Your Confluence account email address bob@sample.com
- **key:** Can be generated within your Confluence account. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.
