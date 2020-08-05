# Language Detection Extension

Provides to detect the language of a text by using the node **detectLanguage**.

## Node: detectLanguage

This node requires four arguments:

1. `Text`: The text from which the language should be detected.
2. `FullResults`: Whether to show the full detection result or just the most probable one.
3. `ContextStore`: Where to store the detected language in the Cognigy Context.
4. `StopOnError`: Whether to stop on an error or not.

After defining the node, the result should look like the following:


- Text: "This is an example sentence to detect the language."
- FullResults: `true`

```json
{
  "key": "value",
  "contextStore": {
    "result": [
      [
        "english",
        0.42243055555555553
      ],
      [
        "spanish",
        0.3027777777777778
      ],
      [
        "pidgin",
        0.29347222222222225
      ],
      ["..."]
    ]
  }
}
```

If you turn off the `FullResults` toggle, the result looks like this:

```json
{
    "contextStore" "english"
}
```

### Notes: 

- The minimum text length for detection is 3. Lower than that the module can only detect Arabic.
- The module uses the node-language-detect npm (https://www.npmjs.com/package/languagedetect). 