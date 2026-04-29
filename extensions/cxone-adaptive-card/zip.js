const { execSync } = require('child_process');
const { name, version } = require('./package.json');

const filename = `${name}-${version}.tar.gz`;
execSync(`tar cfz ${filename} build/* package.json package-lock.json README.md icon.png`, { stdio: 'inherit' });
