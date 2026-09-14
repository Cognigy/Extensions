# NiCEview extension tests

```bash
npm test       # transpile, then run every test
npm run verify # transpile, lint, then run every test
```

No test framework is installed — these use Node's built-in runner (`node --test`, Node 18+) and
`node:assert`. The tests load the **compiled** nodes from `build/` exactly as Cognigy does, and
call each node's `function({ cognigy, config })` with a fake Cognigy `api` and a mocked NiCEview
settings service. `npm test` transpiles first, so a stale `build/` cannot produce a misleading pass.

| File | Covers |
|:--|:--|
| `initial-context.test.js` | NiCEview Init: SIP header parsing, every `ivaParams` shape (wrapped in `{value}`, JSON string, object, invalid), the settings-service fallback, the chat input path |
| `fallback-and-service.test.js` | NiCEview Fallback: demo source handling, configuration errors, plus the settings service helper itself |
| `helpers/harness.js` | Shared fake Cognigy `api` and the mocked settings service |

## Notes

- `helpers/harness.js` installs `global.fetch`. Node runs each test file in its own process, so the
  mocks cannot leak between files.
- Several tests encode a specific past bug: that `context.data.ivaParams` always exists (flows read
  it directly), that a failing settings call never overwrites good SIP header values, that
  `input.data` is never mutated, and that the inContact IDs are trimmed before a flow uses them.
- `test/` is not part of the packaged extension: `zip.js` only includes `build/`, `package.json`,
  `package-lock.json`, `README.md` and `icon.png`.
