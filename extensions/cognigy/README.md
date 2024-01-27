# Cognigy.AI Extension

This Extension provides basic nodes to extend the Cognigy.AI core features.

## Node: Intent Disambiguation

This node reviews the intent mapper result from the Cognigy NLU and finds intents that are within the specified score delta. These intents are recorded and saved in order of similarity to the Cognigy Context. The disambiguation sentences for each intent can also posted back to the user as quick replies, a list or plaintext with a specified `text` message. A maximum of **three** disambiguation sentences in addition to the main intent disambiguation sentence will be posted back.

The stored response looks like the following:

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
### Display Options

Here is a brief summary of the additional options. 

* **Disambiguation Question**: The sentence which should be shown when triggering the node. In the case of 'Plain Text' it will be the first part of the sentence.

* **Reply Type**: Determines the type of message to be displayed to the user. This can either be 'Quick Replies', 'List', 'Plain Text' or 'Data Only'. 'Data Only' only adds the data to the context or input without sending a message to the user. 

* **Punctuation**: If you choose 'Plain Text' as a reply type, the answer will be displayed as a complete sentence. With this field you can determine how the sentence should end. 

**Important**

The `maximum delta value` should be between 0 and 1. The smaller the value, the more refined the disambiguation results will be.
