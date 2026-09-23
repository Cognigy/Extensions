// secrets.local.ts is not committed, so a fresh clone is built from secrets.example.ts.
// If a value is added to one and not the other, that clone fails to compile with a
// "has no exported member" error - on someone else's machine, not on the author's.
// This catches the drift here instead.
const test = require('node:test');
const assert = require('node:assert');
const { require_ } = require('./helpers/harness');

const local = require_('helpers/secrets.local.js');
const example = require_('helpers/secrets.example.js');

const names = (module_) => Object.keys(module_).sort();

test('the secrets example declares exactly the same values as the real file', () => {
    assert.deepStrictEqual(names(example), names(local),
        'add the value to BOTH src/helpers/secrets.local.ts and src/helpers/secrets.example.ts');
});

test('every secret is a non-empty string', () => {
    for (const name of names(local)) {
        assert.strictEqual(typeof local[name], 'string', `${name} must be a string`);
        assert.ok(local[name].length > 0, `${name} is empty - the service call would silently go nowhere`);
    }
});

test('the URLs carry no trailing slash, which would double up when a path is appended', () => {
    for (const name of names(local)) {
        if (!local[name].startsWith('http')) continue;
        assert.ok(!local[name].endsWith('/'), `${name} must not end with "/"`);
    }
});
