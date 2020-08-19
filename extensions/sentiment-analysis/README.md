# Sentiment Analysis

This Extension identifies the sentiment of the input text.

### Language

The sentiment can be calculated for this languages:
- English ([AFINN](http://arxiv.org/abs/1103.2903) word list)
- German ([PolArt](https://docs.google.com/viewer?a=v&pid=sites&srcid=ZGVmYXVsdGRvbWFpbnxpZ2dzYWhvbWV8Z3g6NmQzZjZkNmQxNGRhNDQ3YQ) word list)
- Spanish ([ML-SentiCon](http://timm.ujaen.es/recursos/ml-senticon/) word list)

## Node: Get Sentiment

As a result the node gives:
- **verdict**: if the score is 0, the verdict of the sentiment is NEUTRAL, if it is higher the verdict is POSITIVE and if it is lower, the verdict is NEGATIVE
- **score**: sum of all scores in the sentence
- **comparative**: score devided by the number of words in the sentence
- **foundWords**: list of the words for which the score was founded
- **negations**: list of the negations in the sentence

The result can be written in either the Cognigy context or input object using the store name given in the node's settings.
It will appear in the form:

1. Input: "I like dogs"
```json
{
  "sentiment": {
    "verdict": "POSITIVE",
    "score": 0.4,
    "comparative": 0.13333333333333333,
    "foundWords": [
      "like: 0.4"
    ],
    "negations": []
  }
}
```

2. Input: "I don't like this movie"
```json
{
  "sentiment": {
    "verdict": "NEGATIVE",
    "score": -0.4,
    "comparative": -0.08,
    "foundWords": [
      "like: 0.4"
    ],
    "negations": [
      "don't"
    ]
  }
}
```


Icon made by [Freepik](https://www.flaticon.com/authors/freepik) from www.flaticon.com
