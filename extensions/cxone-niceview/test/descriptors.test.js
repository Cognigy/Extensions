// UI-level invariants for the node descriptors. These catch mistakes no runtime test would: a field
// missing from the form is invisible in Cognigy, and a preview or condition pointing at a field that
// does not exist silently does nothing.
const test = require('node:test');
const assert = require('node:assert');
const { require_ } = require('./helpers/harness');

const extension = require_('module.js').default;
const nodes = extension.nodes;

const fieldKeys = (node) => new Set((node.fields || []).map(f => f.key));
const formKeys = (node) => new Set((node.form || []).filter(e => e.type === 'field').map(e => e.key));

test('the extension declares its nodes', () => {
    assert.strictEqual(extension.options.label, 'NiCEview');
    const types = nodes.map(n => n.type);
    assert.deepStrictEqual(types, ['setNiCEviewContextInit', 'setNiCEviewContextFallback']);
    assert.strictEqual(new Set(types).size, types.length, 'node types must be unique');
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
            assert.ok(field.description, `field "${field.key}" has no description`);
        }
    });

    test(`${node.type}: selects and conditions are consistent`, () => {
        const keys = fieldKeys(node);
        for (const field of node.fields || []) {
            if (field.type === 'select') {
                const options = field.params && field.params.options;
                assert.ok(Array.isArray(options) && options.length > 0, `select "${field.key}" has no options`);
                if (field.defaultValue !== undefined) {
                    assert.ok(options.some(o => o.value === field.defaultValue),
                        `select "${field.key}" defaults to a value that is not one of its options`);
                }
            }
            if (field.condition) {
                assert.ok(keys.has(field.condition.key), `field "${field.key}" is conditioned on unknown field "${field.condition.key}"`);
                const target = node.fields.find(f => f.key === field.condition.key);
                const options = target.params && target.params.options;
                if (Array.isArray(options)) {
                    assert.ok(options.some(o => o.value === field.condition.value),
                        `field "${field.key}" waits for a value "${field.condition.key}" can never hold`);
                }
            }
        }
    });
}
