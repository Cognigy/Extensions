# Cognigy.AI Extension

This Extension provides basic nodes to extend the Cognigy.AI core features.

## Node: Send Email With Attachment

This node lets you send emails with attached files, like for example PDF, JPEG or Word files. To send an actual mail, the following arguments have to be defined:

- **Connection**:
You need to create a Connection. Name is for example 'Email Connection' or something similar. Now you need some Connection keys:
	- Email Server Hostname:
		- key: **host**
		- value: *The STMP host of your Mailserver. Please ask your administrator.*
	- Email Server Port:
		- key: **port**
		- value: The port of your email server; 465 or 587
	- Email Server Security Option:
		- key: **security**
		- value: `TLS`, `STARTTLS` or `NONE`
	- Email Username:
	   - key: **user**
	   - value: *The username of your Email account*
	- Email Password:
		- key: **password**
	   - value: *The password of your Email Account*
- **fromName**: *The name of the sender*
- **fromEmail**: *The email address of the sender*
- **to**: *The emails that should receive your message*
	- You can provide one or more emails by just adding them to the list:
		- `info@cognigy.com,support@cognigy.com,...`
- **subject**: *The email's subject*
- **attachmentName**: *OPTIONAL. The name of your attached file*
	- Something like `file.pdf` if it is a PDF file
- **attachmentUrl**: *If you want to send an attachment, you also have to define the path to the file; the URL*
	- Example: https://path-to-file.pdf
	- **IMPORTANT**: The path to the file has to public and accessible from the outer world!
- **contextStore**: *How to store the result in the Cognigy Context. It's a simple name*
	- Example: `mailResponse`
- **stopOnError**: *Wether to stop the Flow if something went wrong or not*

If everything went well so far, the mail should be sent to the receivers and the node stores a success message into the Cognigy Context:
```json
{
  "mail": "Message sent: <8bcf7879-127a-3f5a-dd22-d1ad2ceb9c83@example.com>"
}
```

## Node: Get Conversation

Obtain a conversation transcript from the Cognigy analytics OData endpoint, typically for human consumption, and often for the current session making the request.

The conversation can be returned as **raw data**, or as **HTML** designed for email embedding, and which can also be styled by supplied CSS styles.

The Node can be used simply, with defaults, or a number of customisation options are available as outlined below.

### Configuration Fields:
* **Cognigy API Connection**: Provide a Cognigy user's apiKey which has access to the required OData

* **OData Base URL**: Typically your Cognigy login server host, preceded by "https://odata-"

* **Conversation User ID**: The Cognigy userId to target - Leave the default for the current session

* **Conversation Session ID**: The Cognigy sessionId to obtain - Leave the default for the current session

* **Output Type**: JSON or HTML - See below

* **User Timezone Offset**: For HTML: Used to include 'user time' timestamps in the HTML transcript

### Store the result in Input (ci) or Context (cc)
Due to the default size limit of 'cc' and the potential for long conversations, results can be marshaled into Input (ci) or Context (cc).

Input (ci) is recommended to avoid exceeding the default limit of cc (around 500kB by default).

### Result structure
The result, placed in ci.conversation or cc.conversation (per defaults and selections), will be structured like so:
```typescript
{
    // The channel (first evident in the session)
    channel: "webchat" | "adminconsole" | "facebook" | etc,

    // If the HTML Output Type option is requested:
    html: "<table ...> Table contents... </table>",

    // If the JSON Output Type is requested:
    transcript: [
        {
            type: 'input' | 'output',
            source: 'user' | 'bot',
            text: '[The text transcript from Default or Channel]',
            data: {},   // Optional data object
            timestamp: '2020-08-07T05:15:07.597Z'   // - UTC time for JSON Output Type
        },
        {
            // Next transcript in time order
        },
        {
            // etc
        }
    ]
}
```

### JSON output option
With the Output Type set to JSON, a JSON array will be returned as shown above, containing a minimal set of analytics fields per interaction, to keep the data size to a minimum.

### HTML output option
With the Output Type set to HTML, the transcript will be returned as one long string, containing a formatted html \<table\> element with columns of Time, Source and Text transcript.

CSS styles are 'inlined', as this results in the most broad compatibility with many and varied email client software.

#### User Timezone Offset
To be able to display chat transcript times in a time accurate for the user, we need to know what timezone the user is (was) in. Supply this here as an hours offset like "-6" or "+10". For half-hour offsets, use minutes like "-90" for 1.5 hours.

If the user's Timezone is not known, it is suggested to pick some logical/likely fixed timezone, and then use ```ci.GetConversationTimeFormat``` as described below to _state_ the timezone (e.g. CET or AEDT) in the time format string. e.g. "(17:43:20 CET)".

#### 'bot' and 'user' labels
If you wish to change the labels of 'bot' and 'user' in the output, you can simply do a string-replace in the resultant html string, replacing "```>bot<```"  with (for example) "```>Virtual Assistant<```"; or similarly for "```>user<```". Be sure to maintain the 'greater than' and 'less than' symbols at each end of the string.

#### Adding a heading row
If you wish to add a heading row, there is a string in the returned html: ```<!--FirstRow--\>``` which can be string-replaced with your desired first row made up of ```<tr>``` and ```<td>``` tags. Note that you must supply your own inline styling to these tags, if desired.

#### HTML styling
By default, the HTML table will be styled with the styles shown below.

Note that there are styles for the table itself, and then for each one of bot/user, you can modify the row (tr) and data-cell (td) styles.
```html
<style>
    table { font-family: arial; border-collapse: collapse; outline:thin solid; }
    tr { padding: 8; }
    td { padding: 8; }
    tr.bot { background: #DDDDFF; }
    tr.user {}
    td.user-time { font-weight: bold; }
    td.bot-time { font-weight: bold; }
    td.user-source {}
    td.bot-source {}
    td.user-text {}
    td.bot-text {}
</style>
```
The styles are forced 'inline' into the final html table to maximise compatibility with email clients.
If you wish to alter any styling, copy the complete style tag above, make your modifications, and set in the variable ```ci.GetConversationStyles``` before calling the custom module.

Similarly, the time format can be altered via ```ci.GetConversationTimeFormat```, which default to ```[(]HH:mm:ss[)]```. See the [moment formatting options](https://momentjs.com/docs/#/displaying/format) for details.


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
### Node: Display Options

Here is a brief summary of the additional options. 

* **Disambiguation Question**: The sentence which should be shown when triggering the node. In the case of 'Plain Text' it will be the first part of the sentence.

* **Reply Type**: Determines the type of message to be displayed to the user. This can either be 'Quick Replies', 'List', 'Plain Text' or 'Data Only'. 'Data Only' only adds the data to the context or input without sending a message to the user. 

* **Punctuation**: If you choose 'Plain Text' as a reply type, the answer will be displayed as a complete sentence. With this field you can determine how the sentence should end. 

**Important**

The `maximum delta value` should be between 0 and 1. The smaller the value, the more refined the disambiguation results will be.
