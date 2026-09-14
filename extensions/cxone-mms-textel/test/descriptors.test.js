// UI-level invariants for the node descriptor. These catch mistakes no runtime test would: a field
// missing from the form is invisible in Cognigy, and a preview pointing at a field that does not
// exist silently does nothing.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const extension = require(path.join(__dirname, '..', 'build', 'module.js')).default;
const nodes = extension.nodes;
const connectionTypes = new Set((extension.connections || []).map(c => c.type));

const fieldKeys = (node) => new Set((node.fields || []).map(f => f.key));
const formKeys = (node) => new Set((node.form || []).filter(e => e.type === 'field').map(e => e.key));

test('the extension declares its node and connection', () => {
    assert.deepStrictEqual(nodes.map(n => n.type), ['sendTextelMms']);
    assert.deepStrictEqual([...connectionTypes], ['textelConnection']);
});

for (const node of nodes) {
    test(`${node.type}: every field is reachable in the UI`, () => {
        const inForm = formKeys(node);
        for (const key of fieldKeys(node)) {
            assert.ok(inForm.has(key), `field "${key}" is not in the form - it would be invisible`);
        }
    });

    test(`${node.type}: the form only references real fields`, () => {
        const keys = fieldKeys(node);
        for (const key of formKeys(node)) {
            assert.ok(keys.has(key), `form references unknown field "${key}"`);
        }
    });

    test(`${node.type}: label, summary, colour and preview are sound`, () => {
        assert.ok(node.defaultLabel);
        assert.ok(node.summary, 'a node needs a summary - it is what the node list shows');
        assert.ok(node.appearance && node.appearance.color);
        if (node.preview && node.preview.key) {
            assert.ok(fieldKeys(node).has(node.preview.key),
                `preview.key "${node.preview.key}" is not a field - the preview would stay blank`);
        }
    });

    test(`${node.type}: every field explains itself`, () => {
        for (const field of node.fields || []) {
            assert.ok(field.label, `field "${field.key}" has no label`);
            if (field.type !== 'connection') {
                assert.ok(field.description, `field "${field.key}" has no description`);
            }
        }
    });

    test(`${node.type}: the connection field names the declared connection`, () => {
        for (const field of node.fields || []) {
            if (field.type !== 'connection') continue;
            const wanted = field.params && field.params.connectionType;
            assert.ok(connectionTypes.has(wanted), `connection field wants "${wanted}", which is not declared`);
        }
    });

    test(`${node.type}: the required fields are the ones the node cannot work without`, () => {
        const required = (node.fields || []).filter(f => f.params && f.params.required).map(f => f.key).sort();
        assert.deepStrictEqual(required, ['bodyText', 'connection', 'fromPhoneNumber', 'toPhoneNumber'],
            'To, From, Message and the connection are mandatory; the attachment is not');
    });
}
