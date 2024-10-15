# Example Extension

This is an example Extension that is designed to get you started with Cognigy.AI Extensions. It features a number of nodes that show a range of options and features - ranging from custom input fields to dynamic output and API requests. 

**Connection: apiKeyConnection**

Some nodes require a [Connection](https://docs.cognigy.com/docs/connections) that can be used to handle API credentials. 

This example Connection only requires you to fill out one field:
- key

----
## Node: executeCognigyApiRequest
This Node shows how an API request can be executed from within an Extension. 
It requires the following fields to be filled out:

**Fields:**
#### Connection
The connection that needs to be configured in order to provide an API key. 

#### Path
The API path to call.

----
## Node: randomPath

This Node picks a (sub) path at random. It shows how you can make Nodes with different outcomes, typically used in logic Nodes like the IF Node. 

<img align="center" width="300" height="181" src="https://github.com/Cognigy/Extensions/blob/master/docs/images/random-path.jpg">

----
## Node: reverseSay

This Node takes a text input (either dynamic or hardcoded) and reverses the string. It demonstrates how to take dynamic input and process it before outputting it again. This Node also shows how to directly generate output, instead of writing the outcome to the [Context](https://docs.cognigy.com/docs/context) or [Input](https://docs.cognigy.com/docs/input) objects. 

----

## Node: fullExample
This Node shows the possible input field types that can be exposed in the Extension's configuration. The different field types are:

- CognigyText
- TextArray
- Checkbox
- Chips
- Number
- Slider
- Toggle
- Date
- Datetime
- Daterange
- Timepicker
- JSON
- XML
- Say
- Connection
- Adapative Cards
- Background Selector
- Select


<img align="center" width="250" height="496" src="https://github.com/Cognigy/Extensions/blob/master/docs/images/input-fields.JPG">