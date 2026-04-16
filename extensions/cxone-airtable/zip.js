const { execSync } = require('child_process');
const { version, name } = require('./package.json');
const fs = require('fs');

const filename = `${name}-${version}.tar.gz`;
const optionals = ['README.md', 'icon.png'].filter(f => fs.existsSync(f)).join(' ');
const extras = optionals ? ` ${optionals}` : '';
execSync(`tar cfz ${filename} build/* package.json package-lock.json${extras}`, { stdio: 'inherit' });
console.log(`Packaged: ${filename}`);
