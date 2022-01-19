# Wikipedia

- [Documentation](https://en.wikipedia.org/api/rest_v1/#/Mobile/getSections)

**Information** \
By using this API, you agree to Wikimedia's Terms of Use and Privacy Policy. Unless otherwise specified in the endpoint documentation below, content accessed via this API is licensed under the CC-BY-SA 3.0 and GFDL licenses, and you irrevocably agree to release modifications or additions made through this API under these licenses. See https://www.mediawiki.org/wiki/REST_API for background and details.

## Node: Search Aritcle

With this Flow Node, the **summary** of a found Wikipedia article will be returned in order to be used in the further conversation. As parameter, the `title` has to be provided -- e.g. Will Smith. If no article was found, the **On Not Found** path will be executed. Otherwise, the found article is returned and stored in the `input` or `context` object:

```json
{
    "wikipedia": {
        "type": "standard",
        "title": "Will Smith",
        "displaytitle": "Will Smith",
        "namespace": {
            "id": 0,
            "text": ""
        },
        "wikibase_item": "Q40096",
        "titles": {
        "canonical": "Will_Smith",
        "normalized": "Will Smith",
        "display": "Will Smith"
        },
        "pageid": 154698,
        "thumbnail": {
            "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/TechCrunch_Disrupt_2019_%2848834434641%29_%28cropped%29.jpg/215px-TechCrunch_Disrupt_2019_%2848834434641%29_%28cropped%29.jpg",
            "width": 215,
            "height": 320
        },
        "originalimage": {
            "source": "https://upload.wikimedia.org/wikipedia/commons/3/3f/TechCrunch_Disrupt_2019_%2848834434641%29_%28cropped%29.jpg",
            "width": 941,
            "height": 1397
        },
        "lang": "en",
        "dir": "ltr",
        "revision": "1043775909",
        "tid": "1c14bb60-1786-11ec-a01e-952f490cdbaa",
        "timestamp": "2021-09-11T22:53:09Z",
        "description": "American actor and rapper",
        "description_source": "local",
        "content_urls": {
            "desktop": {
                "page": "https://en.wikipedia.org/wiki/Will_Smith",
                "revisions": "https://en.wikipedia.org/wiki/Will_Smith?action=history",
                "edit": "https://en.wikipedia.org/wiki/Will_Smith?action=edit",
                "talk": "https://en.wikipedia.org/wiki/Talk:Will_Smith"
            },
            "mobile": {
                "page": "https://en.m.wikipedia.org/wiki/Will_Smith",
                "revisions": "https://en.m.wikipedia.org/wiki/Special:History/Will_Smith",
                "edit": "https://en.m.wikipedia.org/wiki/Will_Smith?action=edit",
                "talk": "https://en.m.wikipedia.org/wiki/Talk:Will_Smith"
            }
        },
        "extract": "Willard Carroll Smith Jr. is an American actor, rapper, and film producer. Smith has been nominated for five Golden Globe Awards and two Academy Awards, and has won four Grammy Awards.",
        "extract_html": "<p><b>Willard Carroll Smith Jr.</b> is an American actor, rapper, and film producer. Smith has been nominated for five Golden Globe Awards and two Academy Awards, and has won four Grammy Awards.</p>"
    }
}
```

This response could be displayed dynamically using an Adaptive Card:

<img src="./docs/wikipediaAdaptiveCardExample.PNG" width="400" />