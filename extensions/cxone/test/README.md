# CXone extension tests

```bash
npm test       # transpile, then run every test
npm run verify # transpile, lint, then run every test
```

No test framework is installed — these use Node's built-in runner (`node --test`, Node 18+) and
`node:assert`, so there is nothing extra to keep up to date.

The tests load the **compiled** nodes from `build/` exactly as Cognigy does, and call each node's
`function({ cognigy, config })` with a fake Cognigy `api` and a mocked CXone API. `npm test`
transpiles first, so a stale `build/` cannot produce a misleading pass.

| File | Covers |
|:--|:--|
| `tms-transcript.test.js` | Send Transcript to TMS: payload contract, the duplicate guard, every "nothing worth posting" case, failure handling |
| `handover.test.js` | Exit Interaction: voice signal, optional parameters, the TMS hand-off with Send Transcript, the CXone Guide Chat payload |
| `api-caller.test.js` | CXone API Caller: headers/body as object or JSON string, optional bodies, HTTP status visibility, validation |
| `signal-and-context.test.js` | Signal Interaction and Context Init (voice headers, chat input, Testchat fallback) |
| `knowledge-hub.test.js` | Knowledge Hub: response-code mapping, conversation reference, non-JSON responses, utterance privacy |
| `auth.test.js` | Token and discovery caching per environment/tenant, and refresh-and-retry-once on a rejected token |
| `helpers.test.js` | `json-field`, `tms-payload`, `redact`, `tms-guard` |
| `helpers/harness.js` | Shared fake Cognigy `api` and the mocked CXone API |

## Notes

- **Runtime is around 50 seconds.** Exit Interaction deliberately waits 5 seconds before returning
  control to the flow, and several tests exercise it.
- `helpers/harness.js` installs `global.fetch`. Node runs each test file in its own process, so
  the mocks cannot leak between files.
- The tests assert on behaviour the nodes promise to a flow builder: what reaches CXone, what is
  written to the context, what the customer is told, and what is kept out of the logs. Several
  encode a specific past bug — for instance that a transcript is never posted twice for the same
  contact, that identifiers are trimmed before they reach a URL, and that a customer's words never
  appear in the Cognigy log.
- `test/` is not part of the packaged extension: `zip.js` only includes `build/`, `package.json`,
  `package-lock.json`, `README.md` and `icon.png`.
