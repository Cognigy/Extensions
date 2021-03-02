**Connection**

In order to use the **Send Message** node, one has to use the following credentials:

- key: webhookUrl
- value: The Slack App Webhook URL for the channel the message should be sent to. [Find more information here](https://api.slack.com/messaging/webhooks).


## Node: Send Message

This node sends a message to a Slack channel that is specified by the chosen Webhook URL in the Connection.

A use case could be sending the transcript of a Cognigy.AI conversation to Slack, for example. Inside the **Slack Channel**, the sent message would look like:

![Chat Request](./docs/messageWithImage.png)

Since Slack supports the use of Markdown, one can add links, images or formatting to the text message. Using the image on the right side is optional and can be changed in the Advanced section.