# Microsoft Flows

This Extension allows you to connect to Microsoft Power Automate Flows directly.

## Start MS Flow

This Node contains all the functionality to use start a Microsoft Power Automate Flow.

Microsoft Flow can call Cognigy.AI back and inject a message into an existing session. This can for example be useful to notify the user of a step in Microsoft Flow finishing.

In order to call Cognigy.AI back, we need various parameters:

userId*

sessionId*

callback url* (this is your inject or notify API URL)

endpoint url token* (this is the unique identifier in the Endpoint URL)

text

data

If the Callback API URL parameter of the Node is not empty, this module will automatically append all parameters marked with * to the Payload which is being sent to Microsoft Flow. Flow can then use a HTTP request to call Cognigy.AI back with the required text and data.
