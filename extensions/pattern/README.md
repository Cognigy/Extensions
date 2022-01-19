# Overview
Pattern matching Node for compound slots in Cognigy.AI.

You can define patters which will be searched for in the input text or the alternate text which was provided. If a pattern is found, a compoundSlot group will be created in the input object.

## Patterns
Patterns can be any text and can contain references to slots by using the `@` symbol. 

Example: `@color @product`

A text like `I need a green shirt` would find the compound slot group and assign color = green and product = shirt

### Tags
Slots can be tagged in a pattern to be easier identifiable later.

Example: `from @city>origin to @city>destination`

A text like `I want to go from Düsseldorf to Tokyo` would find a compound group with origin and destination set.

**Example**

Text: `I want to fly from bErlin to los angEles at 3 or 4 tomorrow if its 30 degrees and I am 22 years old 100%`

Pattern: `from @city>origin to @city>destination at @NUMBER>time or @NUMBER>atime @DATE>date if its @TEMPERATURE>celsius degrees and I am @AGE>userage years old @PERCENTAGE>perc`

Result:
```JSON
"compoundSlots": {
        "group": [
            {
                "matchedPhrase": "from bErlin to los angEles at 3 or 4 tomorrow if its 30 degrees and I am 22 years old 100%",
                "origin": "Berlin",
                "destination": "Los Angeles",
                "time": 3,
                "atime": 4,
                "date": {
                    "start": {
                        "day": 15,
                        "month": 6,
                        "year": 2020,
                        "hour": 12,
                        "minute": 0,
                        "second": 0,
                        "millisecond": 0,
                        "text": "tomorrow",
                        "weekday": 1,
                        "dayOfWeek": "Monday",
                        "ISODate": "2020-06-15T12:00:00"
                    },
                    "end": null
                },
                "celsius": 30,
                "userage": 22,
                "perc": 100
            }
        ]
    }
```