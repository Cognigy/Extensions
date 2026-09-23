// Endpoints and keys for the NiCEview services - TEMPLATE.
//
// The real values live in `secrets.local.ts`, which is NOT committed. That file is compiled
// into the extension, so the team gets the values in the built .tar.gz while the public
// repository never sees them.
//
// Setup on a fresh clone:
//   npm run secrets      # creates secrets.local.ts from this file
//   ...then paste the real values into secrets.local.ts
//
// `npm run transpile` / `build` / `verify` run that step for you, so a clone always compiles -
// it just compiles with placeholders until someone fills them in.

/** The NiCEview demo-settings service (getNiCEviewData). */
export const NICEVIEW_SETTINGS_URL = "https://REPLACE-ME.lambda-url.us-west-2.on.aws";

/** The NiCEview demo-log service, without a trailing slash. */
export const DEMO_LOG_URL = "https://REPLACE-ME.lambda-url.us-west-2.on.aws";

/** The x-flow-key the demo-log service expects. */
export const DEMO_LOG_FLOW_KEY = "REPLACE-ME";

/** Our CXone Business Unit, used to build the stand-in ocpSessionId for test runs. */
export const NICEVIEW_BUSINESS_UNIT = "0000000";
