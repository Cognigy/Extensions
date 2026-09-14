# Textel SMS/MMS extension tests

```bash
npm test       # transpile, then run every test
npm run verify # transpile, lint, then run every test
```

No test framework is installed — these use Node's built-in runner (`node --test`, Node 18+) and
`node:assert`. `send-sms.test.js` loads the **compiled** node from `build/` exactly as Cognigy does
and calls its `function({ cognigy, config })` with a fake Cognigy `api` and a mocked Textel API.
`npm test` transpiles first, so a stale `build/` cannot produce a misleading pass.

Covered: phone-number formatting (10 digit, 11 digit, international, punctuation), attachment URL
validation, the Textel endpoint and bearer token, context bookkeeping, configuration errors, and
API failures.

## Notes

- Several tests encode a specific past bug: that the message text never reaches the logs, that an
  invalid attachment URL is reported instead of silently dropped, and that neither a configuration
  error nor an API failure sends internal details to the customer.
- When asserting that message content is absent from the logs, avoid digit strings — the phone
  numbers in the log lines contain digit runs that can collide with them.
- `test/` is not part of the packaged extension: the `zip` script only includes `build/`,
  `package.json`, `package-lock.json`, `README.md` and `icon.png`.
