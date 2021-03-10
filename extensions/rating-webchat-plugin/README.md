# Rating Card Webchat Plugin companion extension

A companion extension to [Rating Webchat Plugin](https://github.com/Cognigy/WebchatPlugins/tree/master/plugins/rating). It adds a Show Rating Card node that shows a rating card with the properties set by the user. The webchat must load the Rating plugin to render this card, otherwise it will not show anything.

The Show Rating Card node simply sends a message, which is equivalent to running the following in a Code node:

```json
api.say('', {
  "_plugin": {
    "type": "rating",
    "title": "Rating message example", // Is required
    "initialRating": 1, // 1, 2, ..., 10
    "size": "large", // "small", "medium", "large"
    "variant": "emoji", // "star", "heart", "emoji" 
    "maxRatingValue": 2, // 2, 3, ..., 10
    "precision": 1, // 0.5, 1
    "rateButtonText": "Send Rating",  // Is required
    "label": "Rating submitted", // Can be empty
    "payload": "stars" // Can be empty
  }
});
```