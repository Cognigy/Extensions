
# Atlassian Confluence

Integrates Cognigy.AI with Confluence (https://www.atlassian.com/software/confluence)

Confluence is a popular collaboration tool that allows teams to work together by writing knowledge articles, how-to's and other guides. By using Confluence in conjunction with Cognigy.AI, it becomes possible to create intelligent bots that can search through your Confluence knowledge base and give detailed instructions. This conversational AI can then be released cross-channel.


**Connection:**

This modules needs a CognigySecret to be defined and passed to the Nodes. A Cognigy Secret can be added to any Cognigy project and allows for the encryption of sensitive data. The secret must have the following keys:

- domain (e.g. https://test.atlassian.net)

- username (Your Jira account email address bob@sample.com)

- key (Can be generated within your Jira Project. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.)

## Node: Search

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


## Node: Get All Pages

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

 ---

 # Confluence Knowledge Connector

Confluence knowledge connector allows you to connect to Confluence and retrieve data from its pages or folders.

The extension uses the [turndown](https://www.npmjs.com/package/turndown/v/4.0.0-rc.1) npm package to convert the content returned by Confluence into Markdown format. With Turndown, you can customize or extend the handling of HTML tags by adding your own rules.

### Heading-Based Chunking
Content is automatically divided into chunks based on the heading hierarchy and the target heading level defined by TARGET_HEADING_LEVEL. For example, if TARGET_HEADING_LEVEL = 2, the chunking behavior will be as follows:
- **H1, H2**: Start new chunks
- **H3, H4, H5, H6**: Included in the current chunk

### Supported Content Types
- Plain text and formatted text
- Tables
- Bulleted and numbered lists
- Panels (info, warning, error, success)
- Expandable sections
- Task lists
- Images (alt text extracted)
- Links

----
**Fields:**

**Connection:**

This modules needs a CognigySecret to be defined and passed to the Nodes. A Cognigy Secret can be added to any Cognigy project and allows for the encryption of sensitive data. The secret must have the following keys:
- domain (Not used for Knowledge Connector)
- username (Your Jira account email address bob@sample.com)
- key (Can be generated within your Jira Project. Click [here](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for instructions.)

#### Confluence URL
URL of the Confluence page or folder, that needs to be extracted

#### Extract Descendants
This field is only relevant if the Confluence URL is of a page. In case it's of a folder, all the pages under the folder are extracted.

#### Source Tags
Sets the tags that you want to associate with each knowledge source