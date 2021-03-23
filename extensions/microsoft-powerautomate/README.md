# Microsoft Power Automate

This Extension allows you to connect to Microsoft Power Automate Flows directly.

## Node Start MS Flow

With this node you can trigger and/or send text/data to a Microsoft Power Automate flow. 

The Microsoft Power Automate flow can also call Cognigy.AI back and inject a message or data into an existing session. This can be used, for example, to notify the user when a step in a Microsoft Power Automate Flow is finished. However other payloads can also be send. 

## Configuration Fields

### **Power Automate Flow Connection**

In order to connect to a Microsoft Power Automate Flow you must first set `When an HTTP Request is received` as a trigger. After saving this step you will receive the value you can save into the field `Flow URL`

In order to receive a Callback.AI from the Microsoft Automate Flow into the Cognigy flow. you must also add a JSON Schema with the following Schema into the field `Request Body JSON Schema`

``` json
{
    "type": "object",
    "properties": {
        "userId": {
            "type": "string"
        },
        "sessionId": {
            "type": "string"
        },
        "URLToken": {
            "type": "string"
        },
        "callbackURL": {
            "type": "string"
        },
        "text": {
            "type": "string"
        },
        "data": {}
    }
}
``` 

The `Method` used is dependant on your use cases, but in most cases only Post will be necessary. 

### **CallBack Configuration in Cognigy.AI Flow**

Callbacks are handled via an inject request with the [Cognigy.AI API](https://docs.cognigy.com/docs/using-the-api)


In order to call Cognigy.AI back from the Microsoft Power Automate flow, you must activate `Use Callback` in the `Start MS Flow` node and enter the following parameters. This information is dynamic, which means you will either need to create Tokens in the Cogigy flow or enter the Cognigy script for the fields:

- User ID*: In Cognigy this is the field "{{index.userID}}" 

- Session ID*: In Cognigy this is the field "{{index.sessionId}}" 

- URL*: This is your inject or notify API URL. 

- Token*: This is the unique identifier in the Endpoint URL, in Cognigy this can be found in {{ci.URLToken}}

- Text

- Data

### **CallBack Configuration in Microsoft Power Automate**

In your Microsoft Power Automate flow  must add a step called `HTTP`and set it up as a post request.

 - Method: Post
 - URI: The `callbackURL` you sent to the flow.

You must set up a header with the following information: 
- `Content-Type`: "application/json"
- `X-API-Key`: (here you must enter your key for the Cognigy API which can be created under "My Profile" in Cognigy)

You must also add a body to the HTTP request in the following JSON Schema:

``` json
{
  "userId": userID,
  "sessionId": sessionId,
  "URLToken": URLToken,
  "text": "",
  "data": {}
}
``` 
`userID`, `sessionID` and `URLToken` are the fields you already sent from the Cognigy flow. Microsoft Power Automatate recognizes these as JSON and creates tokens called Dynamic content which can be used to add the information into the body. 

The `text` field can either be a specific text, such as 'Flow complete' or a dynamic field created by the flow. 

**Important**: If you wish to text the callback configuration this will not only work in the integrated chat in the flow. This is because certain information, such as URL Token, are session dependant. You can test the flow by deploying an endpoint, such as the Cognigy Webchat Endpoint.  