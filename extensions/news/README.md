# News API Extension

This Extension integrats Cognigy with the [News API](https://newsapi.org/).

**Connection:**

- key: apiKey
- value: The News API Key
    - You can copy your API Key from [your Account](https://newsapi.org/account)
    - You just have to sign up for free


## Node: getNewsHeadlines: 

This node returns the news headlines of a specifig source or category, from a chosen country in a chosen language -- all options are optional, besides the **Connection**, **contextStore** and **stopOnError** argument: 

```json
{
  "key": "value",
  "news": {
    "status": "ok",
    "totalResults": 10,
    "articles": [
      {
        "source": {
          "id": "der-tagesspiegel",
          "name": "Der Tagesspiegel"
        },
        "author": null,
        "title": "„Wirklich freuen kann ich mich leider nicht“",
        "description": "Weil ihre Konkurrentin dopte, wird Christina Obergföll elf Jahre später olympisches Silber verliehen. Erste Zweifel kamen ihr bereits im damaligen Wettkampf.",
        "url": "https://www.tagesspiegel.de/sport/speerwerferin-obergfoell-erhaelt-nachtraeglich-silber-wirklich-freuen-kann-ich-mich-leider-nicht/24933968.html",
        "urlToImage": "https://www.tagesspiegel.de/images/christina-obergfoell/24934000/1-format530.jpg",
        "publishedAt": "2019-08-23T09:37:40+00:00",
        "content": "Christina Obergföll kann auf eine erfolgreiche Karriere zurückblicken. Bei den Weltmeisterschaften 2013 in Moskau holte die Speerwerferin die Goldmedaille, zwei weitere Male gewann sie Silber. Außerdem gab es da noch diesen dritten Platz bei den Olympischen S… [+2940 chars]"
      }
    ]
  }
}
```

Note that you cannot mix the source with the category! You have to choose one of them!