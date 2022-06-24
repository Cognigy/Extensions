# Microsoft QnA Maker

The Microsoft QnA Maker Extension helps to answer frequently asked questions in a Cognigy.AI virtual agent. Therefore, an already created Knowledgebase can be used as backup if the virtual agent did not find an intent.

- [Microsoft Documentation](https://docs.microsoft.com/en-us/rest/api/cognitiveservices-qnamaker/qnamaker4.0/runtime/generate-answer)

## Connection:

In order to use this integration, a Knowledgebase has to be created in the Microsoft QnA Maker tool online. Please read the following documentation for more information: [Quickstart: Create, train and publish your QnA Maker konwledge base](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/quickstarts/create-publish-knowledge-base?tabs=v1).

As soon as the resource is published, the required credentials are available:

- Runtime Endpoint
  - The URL of QnA Maker instance
- Resource Key
  - The authentication key
- Knowledgebase ID
  - The identifier of the wanted knowledge base

## Node: Generate Answer

This Flow Node aims to find a valid answer for any input text -- mostly the user's text message. Therefore, it takes this text and sends one of two possible responses:

**On Found Answer:**

In this case, a minimum of one fitting article/answer was found in the referenced knowledge base:

```json
{
    "answers": [
        {
            "questions": [
                "Who is Cognigy?"
            ],
            "answer": "Cognigy is an enterprise software provider for Conversational AI automation. Our platform, Cognigy.AI, automates customer and employee communications. Available in on-premises and SaaS environments, Cognigy.AI enables enterprises to have natural language conversations with their users on any channel – webchat, SMS, voice and mobile apps – and in any language.",
            "score": 62.8,
            "id": 2,
            "source": "https://www.cognigy.com/about",
            "isDocumentText": false,
            "metadata": [],
            "context": {
                "isContextOnly": false,
                "prompts": []
            }
        },
        "...": "..."
  ],
}
```

**On Not Found Answer:**

This path is executed, if no article/answer was found for the given input text:

```json
{
    "answers": [
        {
          "questions": [],
          "answer": "No good match found in KB.",
          "score": 0,
          "id": -1,
          "isDocumentText": false,
          "metadata": []
        }
  ],
}
```



