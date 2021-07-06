FuzzySearch adds a local lightweight fuzzy-search as Flow Node to Cognigy.AI. This Custom Module is based on [**Fuse.js**](https://fusejs.io/).

## Node: search

Search the current items by free text and get a list of found items according to the options.

Items could be given in a JSON structured format like

```json
[
  {
      "title": "Old Man's War",
      "author": {
        "firstName": "John",
        "lastName": "Scalzi"
      }
  }
]
```

You can also refer to a model using the following [syntax](https://docs.cognigy.com/docs/cognigyscript#section-for-json-arguments):

```json
{
  "$cs": {
    "script": "cc.model",
    "type": "array"
  }
}
```

Options could be something like

```json
{
  "caseSensitive": true,
  "shouldSort": true,
  "tokenize": true,
  "matchAllTokens": true,
  "findAllMatches": true,
  "includeScore": true,
  "includeMatches": true,
  "threshold": 0.6,
  "location": 0,
  "distance": 100,
  "maxPatternLength": 32,
  "minMatchCharLength": 1,
  "keys": [
    "title",
    "author.firstName"
  ]
}
```

The full list of options - both mandatory and optional - is explained in the **Fuse.js** developer [documentation](https://fusejs.io/).

The result will be stored in either the Cognigy context (`cc.STORE`) or input object (`ci.STORE`) using the store name given in the node's settings.

In case of an error, this is stored in either the Cognigy context (`cc.STORE.error`) or input object (`ci.STORE.error`). 

Usage is explained in the **Fuse.js** developer [documentation](https://fusejs.io/).

## Advanced hints for Custom Module Developers

For making this Custom Module transpile in a Cognigy compatible way, you need to make sure the compiler settings work with the Fuse.js-Library (JavaScript before ES2015) and still support Cognigy specific features. This can be achieved with the following compiler settings:

```json
{   
    "compilerOptions": {
        "rootDir":  "src",
        "outDir":   "build",
        "lib": ["es2015"]
    },
    ...
```
