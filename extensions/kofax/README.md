# Kofax Extension

This Extension integrates [Kofax RPA](https://www.kofax.de/-/media/Files/Datasheets/DE/ps_kofax-kapow_de.pdf) with Cognigy.AI

# Node: Run Robot

This Node runs a specific Kofax Robot, which was created in the [Kofax Design Studio](https://www.coforce.nl/kofax-kapow/design-studio/?lang=en). To test Kofax you can get your Trial [here](https://www.kofax.com/Products/Robotic-Process-Automation/Kapow/rpa-free-trial?crmCampaignID=CMP-14638-T2C7F5). \
To start a robot you have to define one. If you don't know how yet, please follow this [Getting Started Video Collection](https://www.kofax.com/Learn/Videos/kofax-rpa-tutorials?utm_campaign=10758&utm_medium=email&utm_source=Eloqua). 

After this, you can upload your built robot to the **Management Console** and get the example **REST API Request** from the `Repository/Robots` section, where you have to click on the **REST** button on the right side of your uploaded robot.

This Node supports both ***synchronous*** operation, for quick-running robots, as well as ***asnychronous*** operation, for robots which take longer, and require us to continue chatting with the user while the robot runs. The latter is recommended best practice for robots that may take more than about 7 seconds to run.

## Configuration Fields

### **RPA REST Credentials**

(If required by your REST endpoint - RECOMMENDED!)
- username: The user name required to access your REST endpoint
- password: The password required to access your REST endpoint

### **Robot Selection**
Specify your robot via:

1. RPA REST server url: Such as ```http://<ip address>:port```
1. RPA Project Name: The name of the Kofax RPA project where the robot resides
1. Robot Name: The name the robot is saved as (The trailing .robot is optional here)

### **Input Parameters**
Most robots will take one or more input parameters, in the form of variables and attributes.

The Run Robot Node allows you to specify the input parameters either as a list of formatted 'Variable:Attribute' strings, or for full control, you can specify the entire JSON payload explicitly.

**Specifying by Variable:Attributes:**

Kofax RPA requires each of the following for each Variable:Attribute:

1. The Variable name
1. The Attribute name (which is part of the variable)
1. The Attribute type
1. The Attribute value

Specify each required Variable:Attribute via a string formatted like so:

```
myVariable:myAttribute:attributeType=Attribute Value
```

For example, to set 2 Attributes in 1 Variable:

```
searchTerms:searchPhrase:text=red antelopes
searchTerms:searchLimit:number=5
```
(Check attributeType details with your Kofax robot)

**Include Cognigy Inject Details**

Use this option to easily support the 'Inject' function described below - The required details will be included in input parameters.

This option essentially adds these Variable:Attribute specifications:
```
cognigyInjectDetails:userId:text={{ci.userId}}
cognigyInjectDetails:sessionId:text={{ci.sessionId}}
cognigyInjectDetails:URLToken:text={{ci.URLToken}}
```

**Specifying by JSON:**

Choose this option to specify the full request payload explicitly. The payload typically follows this format:
``` json
{
  "parameters": [
    {
      "variableName": "searchItem",
      "attribute": [
        {
          "type": "text",
          "name": "searchItem",
          "value": "hammer"
        }
      ]
    }
  ]
}
```
Note that when this option is used, you must add the Cognigy Inject details to the payload yourself, if required.

### **Request Timeout**
If the Robot may take some time to run and you want to continue the chat with the user in the meantime, which is recommended as best-practice past about 7 seconds, then set the Request Timeout to a small value, such as 2000 (milliseconds = 2 seconds).

In this case you will not receive the final result from the Robot when this Node completes. Instead the robot will continue to run, and you will need to use the Cognigy 'Inject' feature described next to return the fnail result back into the flow.

Note that Cognigy will timeout and log an error if any Extension method takes more than 20 seconds to run. For this reason, the default timeout for this Node is set at 19 second, to more gracefully handle the possible case of a long running robot by default.

# Calling the Cognigy Inject API

If your robot takes more than about 7 seconds to run, it is recommended best practice to allow the chat to continue with the user, while the robot runs asynchronously in the background.

See the 'Request Timeout' setting above.

To receive the final robot result, you can use the Cognigy [Inject API](https://docs.cognigy.com/v4.0/docs/inject-notify#inject). There you can send the stored data as a data object. An example request in **Design Studio** could look like the following: 

![Inject API Request](./docs/image2.png)

The variable `jsonPayload` will later contain the entire robot output in the **data** key:

![Json Payload](./docs/image1.png)

For what do you need the keys?
- **userId**: 
    - The robot has to know which user is chatting
- **sessionId**:
    - Every chat conversation in Cognigy has its own session id, so the robot will know in which conversation he has to inject the message.
- **text**:
    - With this text the robot will inject a message to the flow
    - In this example the intent needs the input text "robot finished" to let the user know that the robot finished his task.
- **URLToken**: 
    - Last but not least the Injection API has to know via which endpoint the chat is available now. After the **Endpoint URL** you only have to copy the ID like `81a96c7f83c4d00bb0e604037e894...`.

With this configuration in your Design Studio robot, the robot will inject the live conversation.