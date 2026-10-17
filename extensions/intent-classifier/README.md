# LLM Intent Classifier (Cognigy Extension)

Classify user intent from text using OpenAI models and store the result in Cognigy input or context. Optionally overwrite `input.intent` and `input.intentScore` so downstream nodes can react to the detected intent.

## Features

- OpenAI Chat Completions–based intent classification
- Customizable intent catalog (name, description, examples)
- Configurable model (default: `gpt-4.1-mini`)
- Stores result in `input` or `context` under a configurable key
- Optional overwrite of `input.intent` and `input.intentScore`

## Prerequisites

- An OpenAI API key with access to the selected model
- A Cognigy.AI tenant with permission to upload extensions and create connections

## Node: LLM Intent Classifier

Adds one node named “LLM Intent Classifier” (type: `classifyIntent`).

- Model: OpenAI model ID to use (default: `gpt-4.1-mini`).
- OpenAI Connection: Select the connection you created.
- Input: The text to classify. Use the UI snippet for `input.text` or provide any string.
- Intents (JSON): Array of intents. Each intent must have `name`; optional `description` and `examples` improve accuracy.
- Overwrite Intent: If enabled, sets `input.intent` and `input.intentScore` from the classification result.
- Store Location: Choose where to store the result object (`input` or `context`).
- Input Key / Context Key: Key name used to store the result object.

### Intents JSON example

```
[
  {
    "name": "Love You",
    "description": "User expresses affection towards the assistant.",
    "examples": ["I love you", "You're amazing", "I adore you"]
  },
  {
    "name": "Complain",
    "description": "User complains or expresses dissatisfaction.",
    "examples": []
  },
  {
    "name": "Fallback",
    "description": "Used when no other intent clearly matches.",
    "examples": []
  }
]
```

### Output

- The node calls OpenAI with a structured system prompt and requests JSON output.
- The response is parsed as an object like:

```
{
  "intent": "Complain",
  "confidence": 0.82
}
```

- Storage:
  - If `Store Location = input`, the object is added to `input[<inputKey>]` (default `classifyIntentResult`).
  - If `Store Location = context`, the object is added to `context[<contextKey>]` (default `classifyIntentResult`).
- Overwrite (optional):
  - `input.intent = <intent>`
  - `input.intentScore = <confidence>`

## Usage Tips

- Be explicit in the `description` and include representative `examples` for each intent to improve accuracy.
- Keep a “Fallback” intent for unmatched inputs.
- Ensure the selected model is available on your OpenAI account and supports `response_format: json_object`.

## Development

- Transpile TypeScript: `npm run transpile`
- Lint sources: `npm run lint`
- Build & package: `npm run build` (produces `intent-classifier.tar.gz`)

Project entrypoint for Cognigy is `build/module.js`, generated from `src/`.

## Troubleshooting

- Authentication errors: Verify the OpenAI connection and API key.
- 404/400 from OpenAI: Check the `model` name and your account access.
- Empty or unexpected output: Review the Intents JSON and the exact text provided in `Input`.
- Network restrictions: Ensure your environment can reach `https://api.openai.com/v1/chat/completions`.

## License

MIT (see `package.json`).
