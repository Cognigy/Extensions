const { execSync } = require('child_process');
const { version } = require('./package.json');

const filename = `signal-cxone-${version}.tar.gz`;
execSync(`tar cfz ${filename} build/* package.json package-lock.json README.md icon.png`, { stdio: 'inherit' });