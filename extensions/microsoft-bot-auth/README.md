# Microsoft Azure Bot Services Token 

Cognigy users who wish to integrate with Microsoft Teams via Microsoft Bot Services registration often notice that it is not possible to upload and process images via copy and paste into the chat or by taking a photo with a cell phone. This extension will not be able to solve this problem directly but it will give the user the tools to solve this problem via a third party RPA service such as Microsoft Power Automate or UiPath by creating a token which can be used as a API Get Request in order to download the image for further processing.

## Connection

In order to create a token to download the image we require the following information: 

- App ID
- App Password

This is the same information you required to set up an [Azure Bot Services Endpoint](https://support.cognigy.com/hc/en-us/articles/360016183720#1-create-a-azure-bot-services-endpoint-0-2).

#### Node: Get Token

This node will create the a token which can be sent to an external service in order to download the image. This is usually found under the following Cognigy Input object:
- `{{input.data.request.attachments[0].contentUrl}}`

Although the user can choose whether to save the token in context or input it is suggested to save this information in the context. 