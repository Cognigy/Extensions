
# Cognigy.AI

This Extension provides Nodes to extend Cognigy.AI core features and Knowledge Connectors to integrate external data sources into Cognigy.AI.

## Table of Contents
- [Cognigy.AI Knowledge Connectors](#knowledge-connectors)
- [Cognigy.AI Nodes](#nodes)

---

# Cognigy.AI Extension

This Extension provides Knowledge Connectors that integrate external data sources into Cognigy.AI. The provided Knowledge Connectors create Knowledge Sources by using web APIs or extracting content from publicly available web pages.

## Knowledge Connectors

### Chuck Norris Jokes

The Chuck Norris Jokes Knowledge Connector fetches random Chuck Norris Jokes using a web API and creates a Knowledge Source with Knowledge Chunks containing the fetched jokes.

The following table shows the fields to configure when using this Knowledge Connector.

| Field                      | Description                                                                                                                                                                     |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source name prefix         | Sets a prefix to be appended to Knowledge Source's name. For example, if you enter `Chuck Norris Jokes`, the Knowledge Source created is named `Chuck Norris Jokes - <number>`. |
| Categories to fetch        | Sets the categories of jokes to fetch. You can find the available categories at [chucknorris.io](https://api.chucknorris.io/), in the `Categories` section.                     |
| Number of jokes per source | Sets a number of jokes per category.                                                                                                                                            |
| Source Tags                | Sets the Source Tags that you want to add to Knowledge Source. Source Tags can be used to filter the search scope when using a Search Extract Output Node.                      |

### Web Page

The Web Page Knowledge Connector lets you extract content from publicly available static web pages. This Knowledge Connector creates a Knowledge Source and Knowledge Chunks based on the web page content.

#### Chunking

The Knowledge Connector divides the web page content automatically into Knowledge Chunks based on semantic structures. If a semantic structure exceeds the 2000 characters, it's split into smaller Knowledge Chunks based on character count.

The following table shows the fields to configure when using this Knowledge Connector.

| Field              | Description                                                                                                                                                             |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source name prefix | Sets an optional prefix to be appended to the Knowledge Source's name. For example, if you enter `Wiki Page`, the Knowledge Source created is named `Wiki Page - <number>`. |
| Web page URL       | Sets the URL of the publicly available web page from which the content is extracted.                                                                                    |
| Source Tags        | Sets the Source Tags that you want to add to the  Knowledge Source. Source Tags can be used to filter the search scope when using a Search Extract Output Node.         |

**Note:** The Knowledge Connector uses the following MIT-licensed libraries: [`html-to-text`](https://www.npmjs.com/package/html-to-text), [`langchain`](https://www.npmjs.com/package/langchain), [`jsdom`](https://www.npmjs.com/package/jsdom)

## Nodes

### Intent Disambiguation

This Node reviews the Intent mapper result from the Cognigy NLU engine and finds Intents that are within the specified score delta. These Intents are stored in order of similarity in the Context object. The disambiguation sentences for each Intent can be posted back to the user as Quick Replies, a list or plain text with a specified `text` message. You can post back up to three disambiguation sentences in addition to the main Intent disambiguation sentence.

The following is an example of a stored response:

```json
"cognigy": {
    "disambiguation": {
      "count": 3,
      "intents": [
        {
          "id": "408fc0a0-f634-4444-9825-7fcb07616b18",
          "name": "FAQ-Management",
          "score": 0.11509306606009306,
          "negated": false,
          "confirmationSentence": null,
          "confirmationSentences": [],
          "disambiguationSentence": "You asked a question about management",
          "flow": "27476df2-8a8b-47f7-ac7a-767cd7861b57",
          "delta": 0.3639332824278372
        },
        {
          "id": "0cd025b6-01f9-4b9b-a6af-9575cff4f949",
          "name": "FAQ-Corporate-Structure",
          "score": 0.05310899814135705,
          "negated": false,
          "confirmationSentence": null,
          "confirmationSentences": [],
          "disambiguationSentence": "You asked a question about corporate structure",
          "flow": "27476df2-8a8b-47f7-ac7a-767cd7861b57",
          "delta": 0.4259173503465732
        },
        {
          "id": "bf3b3599-fbe7-4a68-be16-a62192d04052",
          "name": "FAQ-Locations",
          "score": 0.04672874568886005,
          "negated": false,
          "confirmationSentence": null,
          "confirmationSentences": [],
          "disambiguationSentence": "You asked a question about locations",
          "flow": "27476df2-8a8b-47f7-ac7a-767cd7861b57",
          "delta": 0.4322976027990702
        }
      ]
    }
  }
```

#### Display Options

| Option                  | Description                                                                                                                                                                                                                                                         |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Disambiguation Question | The sentence shown when triggering the Node. In the case of **Plain Text**, this option sets the first part of the sentence.                                                                                                                                        |
| Reply Type              | Sets the type of message to be posted back to the user. You can select the following options: **Quick Replies**, **List**, **Plain Text**, or **Data Only**. **Data Only** adds only the data to the Context or Input object without sending a message to the user. |
| Punctuation             | For the Plain Text reply type, the answer is displayed as a complete sentence. With this field, you can determine how the sentence should end.                                                                                                                      |

**Important**

The maximum delta value is between 0 and 1. The smaller the delta value, the more refined the disambiguation results are.
