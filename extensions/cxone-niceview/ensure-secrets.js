// Makes sure src/helpers/secrets.local.ts exists before the TypeScript build.
//
// secrets.local.ts holds the service URLs and the demo-log flow key and is not committed, so a
// fresh clone has no copy of it. Rather than failing the build with a missing-module error,
// this seeds it from secrets.example.ts and says loudly that the values are placeholders.

const fs = require('fs');
const path = require('path');

const HELPERS = path.join(__dirname, 'src', 'helpers');
const LOCAL = path.join(HELPERS, 'secrets.local.ts');
const EXAMPLE = path.join(HELPERS, 'secrets.example.ts');

if (fs.existsSync(LOCAL)) {
    process.exit(0);
}

if (!fs.existsSync(EXAMPLE)) {
    console.error(`ensure-secrets: neither ${LOCAL} nor ${EXAMPLE} exists - cannot build.`);
    process.exit(1);
}

fs.copyFileSync(EXAMPLE, LOCAL);
console.warn('');
console.warn('  ensure-secrets: created src/helpers/secrets.local.ts from the example.');
console.warn('  It contains PLACEHOLDERS - the demo log and the settings service will not work');
console.warn('  until you paste the real values in. Ask a teammate for them; the file is not');
console.warn('  committed on purpose.');
console.warn('');
