#! /usr/bin/env node
import 'zx/globals';
import createFolder from './utils/createFolder.mjs';
import getBuildName from './utils/getBuildName.mjs'

await $`npm run clean`
await $`npm run build`

// create target folder
await createFolder('target');
// build name
const buildName = await getBuildName();

// zip the files
await $`tar cfz target/${buildName}.tar.gz build/* package.json package-lock.json README.md icon.png`;

