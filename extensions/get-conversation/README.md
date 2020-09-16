# Node: Get Conversation

Obtain a conversation transcript from the Cognigy analytics OData endpoint, typically for human consumption, and often for the current session making the request.

The conversation can be returned as **raw data**, or as **HTML** designed for email embedding, and which can also be styled by supplied CSS styles.

The Node can be used simply, with defaults, or a number of customisation options are available as outlined below.

## Configuration Fields:
* **Cognigy API Connection**: Provide a Cognigy user's apiKey which has access to the required OData

* **OData Base URL**: Typically your Cognigy login server host, preceded by "https://odata-"

* **Conversation User ID**: The Cognigy userId to target - Leave the default for the current session

* **Conversation Session ID**: The Cognigy sessionId to obtain - Leave the default for the current session

* **Output Type**: JSON or HTML - See below

* **User Timezone Offset**: For HTML: Used to include 'user time' timestamps in the HTML transcript

## Store the result in Input (ci) or Context (cc)
Due to the default size limit of 'cc' and the potential for long conversations, results can be marshaled into Input (ci) or Context (cc).

Input (ci) is recommended to avoid exceeding the default limit of cc (around 500kB by default).

## Result structure
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

# JSON output option
With the Output Type set to JSON, a JSON array will be returned as shown above, containing a minimal set of analytics fields per interaction, to keep the data size to a minimum.

# HTML output option
With the Output Type set to HTML, the transcript will be returned as one long string, containing a formatted html \<table\> element with columns of Time, Source and Text transcript.

CSS styles are 'inlined', as this results in the most broad compatibility with many and varied email client software.

## User Timezone Offset
To be able to display chat transcript times in a time accurate for the user, we need to know what timezone the user is (was) in. Supply this here as an hours offset like "-6" or "+10". For half-hour offsets, use minutes like "-90" for 1.5 hours.

If the user's Timezone is not known, it is suggested to pick some logical/likely fixed timezone, and then use ```ci.GetConversationTimeFormat``` as described below to _state_ the timezone (e.g. CET or AEDT) in the time format string. e.g. "(17:43:20 CET)".

## 'bot' and 'user' labels
If you wish to change the labels of 'bot' and 'user' in the output, you can simply do a string-replace in the resultant html string, replacing "```>bot<```"  with (for example) "```>Virtual Assistant<```"; or similarly for "```>user<```". Be sure to maintain the 'greater than' and 'less than' symbols at each end of the string.

## Adding a heading row
If you wish to add a heading row, there is a string in the returned html: ```<!--FirstRow--\>``` which can be string-replaced with your desired first row made up of ```<tr>``` and ```<td>``` tags. Note that you must supply your own inline styling to these tags, if desired.

## HTML styling
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

