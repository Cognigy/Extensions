# Dynamic Yield

Integrates Cognigy.AI with [Dynamic Yield by Mastercard](https://www.dynamicyield.com/).

## Connection

In order to use this Extension, one has to define two values based on their DY instance:

- key
  - The Dynamic Yield API Key
- region
  - "eu" or "us"
  - Default: "us"
  - The Dynamic Yield region that is used for the API endpoint


## Node: Choose

API Docs: https://dy.dev/reference/choosing-variations

This Flow Node lets the virtual agent search for products in Dynamic Yield based on so-called "conditions" that are extracted from the user's text. By default, the "Conditions Option" has the "Use Lexicon" toggle enabled in order to use a Cognigy Lexicon for keyphrase and slot detection. In this case, the Lexicon slots and keyphrases **must** match the filters in Dynamic Yield. However, if no Lexicon should be used, the "Use Lexicon" toggle can be turned off to provide an array (list) of conditions specifically in a JSON field. Please reference the API Docs from above in order to make sure that the conditions are formatted correctly.

If products were found, the results are stored as `products` into the input or context object.