# iCal Conversion Extension

This extension allows you to convert iCal and ICS files (for example the URL for a calendar feed or the download link for the .ics file for a specific event) to JSON as well as convert JSON to a downloadable ical file which can be imported as an event into a calendar program such as Outlook Calendar. 

----

# Node: Convert iCal to JSON via JSON

This node converts raw iCal data saved as a JSON object either in Input or Context as a JSON Object. 

**Fields:**

- Location of JSON: Where the JSON is located in the Context or Input as Cognigy script (for example {{cc.calendarInformation}}) 

----

# Node: Convert iCal to JSON via URL

This node converts raw iCal the URL of an iCal feed, for example the calendar feed for an event website, as JSON for further processing.

**Fields:**

- URL of iCal file: The download URL or iCal feed for the calendar or event you wish to process 

----

# Node: Convert JSON information to iCal

Creates a downloadable iCal file which can be imported into a calendar program. 

**Fields:**

- Event Start Date/Time: The date and/or time when the event starts as CognigyScript. 
- Event End Date/Time: The date and/or time when the event ends as CognigyScript. 
- Event Categories: Categories which describe the event which can be used to connect it to similar events in the calendar program. 
- Event Location: The location of the event.
- Event Summary/Title: The title you wish to give the event. 
- Event Description:  A long description of the event you wish to create. 