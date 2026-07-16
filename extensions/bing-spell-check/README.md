# Bing Spell Check

The Bing Spell Check extension allows you to automatically fix spelling mistakes in the user input, increasing the NLU classification accuracy.

---
## Connection ##

To use the extension, you will need a Bing API access.

----
## Node: Bing Spell Check

This Flow Node sends the user input to the Bing Spell Check API, and automatically applies all suggestions that have a confidence score higher than a given threshold.

**Fields:**

### Bing Connection

To configure the connection, provide the Bing API key.

### Threshold

Threshold defines the minimal confidence score to apply suggested fix.

### Storage Options

Storage Options allow you to store the result in Input or Context.
