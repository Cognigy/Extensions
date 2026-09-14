// UI-level invariants for every node descriptor. These catch mistakes that no runtime test would:
// a field missing from the form is invisible in Cognigy, a preview or condition pointing at a
// field that does not exist silently does nothing, a select default outside its options cannot be
// selected, and a connection field must name a connection this extension actually declares.
const test = require('node:test');
const assert = require('node:assert');
const { require_ } = require('./helpers/harness');

const extension = require_('module.js').default;

const nodes = extension.nodes;
const connectionTypes = new Set((extension.connections || []).map(c => c.type));

const fieldKeys = (node) => new Set((node.fields || []).map(f => f.key));
const formKeys = (node) => new Set((node.form || []).filter(e => e.type === 'field').map(e => e.key));
const sectionKeys = (node) => new Set((node.sections || []).flatMap(s => s.fields || []));

test('the extension declares its nodes and connection', () => {
    assert.ok(nodes.length > 0);
    assert.deepStrictEqual([...connectionTypes], ['cxoneConnection']);
    assert.strictEqual(extension.options.label, 'CXone');

    const types = nodes.map(n => n.type);
    assert.strictEqual(new Set(types).size, types.length, 'node types must be unique');
});

for (const node of nodes) {
    test(`${node.type}: every field is reachable in the UI`, () => {
        const inForm = formKeys(node);
        const inSections = sectionKeys(node);
        for (const key of fieldKeys(node)) {
            assert.ok(inForm.has(key) || inSections.has(key), `field "${key}" is not in the form - it would be invisible`);
        }
    });

    test(`${node.type}: the form only references real fields`, () => {
        const keys = fieldKeys(node);
        for (const key of formKeys(node)) {
            assert.ok(keys.has(key), `form references unknown field "${key}"`);
        }
    });

    test(`${node.type}: preview, label, summary and colour are set`, () => {
        assert.ok(node.defaultLabel, 'a node needs a label');
        assert.ok(node.summary, 'a node needs a summary - it is what the node list shows');
        assert.ok(node.appearance && node.appearance.color, 'a node needs a colour');
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

    test(`${node.type}: selects have options, and their defaults are selectable`, () => {
        for (const field of node.fields || []) {
            if (field.type !== 'select') continue;
            const options = field.params && field.params.options;
            assert.ok(Array.isArray(options) && options.length > 0, `select "${field.key}" has no options`);
            if (field.defaultValue !== undefined) {
                assert.ok(options.some(o => o.value === field.defaultValue),
                    `select "${field.key}" defaults to a value that is not one of its options`);
            }
        }
    });

    test(`${node.type}: conditions point at reachable values`, () => {
        const keys = fieldKeys(node);
        for (const field of node.fields || []) {
            if (!field.condition) continue;
            assert.ok(keys.has(field.condition.key), `field "${field.key}" is conditioned on unknown field "${field.condition.key}"`);
            const target = node.fields.find(f => f.key === field.condition.key);
            const options = target.params && target.params.options;
            if (Array.isArray(options)) {
                assert.ok(options.some(o => o.value === field.condition.value),
                    `field "${field.key}" waits for a value "${field.condition.key}" can never hold`);
            }
        }
    });

    test(`${node.type}: connection fields name a declared connection`, () => {
        for (const field of node.fields || []) {
            if (field.type !== 'connection') continue;
            const wanted = field.params && field.params.connectionType;
            assert.ok(wanted, `connection field "${field.key}" declares no connectionType`);
            assert.ok(connectionTypes.has(wanted), `connection field "${field.key}" wants "${wanted}", which is not declared`);
        }
    });
}

test('the Environment Base URL field is never pre-filled with a listed environment', () => {
    // it only appears for 'Other', so a default pointing at a listed environment would quietly
    // send the call somewhere the flow builder did not choose
    for (const node of nodes) {
        const baseUrl = (node.fields || []).find(f => f.key === 'baseUrl');
        if (!baseUrl) continue;
        assert.strictEqual(baseUrl.defaultValue, undefined, `${node.type}: baseUrl must not have a default`);
        assert.deepStrictEqual(baseUrl.condition, { key: 'environment', value: 'other' }, node.type);
    }
});

test('contact identifier fields default to what Context Init populates', () => {
    const expected = {
        contactId: '{{context.data.contactId}}',
        spawnedContactId: '{{context.data.spawnedContactId}}'
    };
    for (const node of nodes) {
        if (node.type === 'setCxoneContextInit') continue; // it is the node that fills the context
        for (const field of node.fields || []) {
            if (expected[field.key]) {
                assert.strictEqual(field.defaultValue, expected[field.key], `${node.type}.${field.key}`);
            }
        }
    }
});
