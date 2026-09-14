// Signal Interaction and Context Init.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, apiCalls, ENVIRONMENT, CONNECTION } = require('./helpers/harness');

const { sendSignalToCXone } = require_('nodes/send-signal.js');
const { setCxoneContextInit } = require_('nodes/init-context.js');

const signalConfig = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT,
    contactId: '9001',
    signalParams: '["Escalate"]',
    connection: CONNECTION
}, overrides);

const signal = (harness, overrides) => sendSignalToCXone.function({ cognigy: harness.cognigy, config: signalConfig(overrides) });

test('voice: parameters given as a JSON string become p1, p2, ...', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});

    await signal(h, { signalParams: '["Escalate","VIP"]' });

    assert.ok(cxone.calls.some(c => c.includes('/interactions/9001/signal?p1=Escalate&p2=VIP')), cxone.calls.join('\n'));
});

test('voice: parameters given as an array work too', async () => {
    const cxone = mockCxone();
    await signal(makeCognigy({}), { signalParams: ['Escalate', 'VIP'] });

    assert.ok(cxone.calls.some(c => c.includes('p1=Escalate&p2=VIP')));
});

test('voice: object parameters are serialized instead of "[object Object]"', async () => {
    const cxone = mockCxone();
    await signal(makeCognigy({}), { signalParams: [{ k: 'v' }] });

    assert.ok(cxone.calls.some(c => c.includes(encodeURIComponent('{"k":"v"}'))), cxone.calls.join('\n'));
});

test('a chat channel returns Intent and Params without calling CXone', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'webchat' });

    await signal(h, { signalParams: '["Escalate","VIP"]' });

    assert.strictEqual(cxone.calls.length, 0, 'no token or discovery traffic on chat channels');
    assert.deepStrictEqual(h.outputs[0].data, { Intent: 'Signal', Params: 'Escalate|VIP' });
});

test('signalling with no parameters fails with a clear message', async () => {
    mockCxone();
    await assert.rejects(() => signal(makeCognigy({}), { signalParams: '[]' }),
        /'Signal Parameters' must contain at least one value/);
});

test('invalid parameter JSON names the field', async () => {
    mockCxone();
    await assert.rejects(() => signal(makeCognigy({}), { signalParams: 'not json' }), /Signal Parameters must be valid JSON/);
    await assert.rejects(() => signal(makeCognigy({}), { signalParams: '{"a":1}' }), /must be a valid JSON array/);
});

test('a missing connection is reported before anything else', async () => {
    mockCxone();
    await assert.rejects(() => signal(makeCognigy({}), { connection: undefined }), /Connection not found/);
});

const voiceInput = (headers) => ({ payload: { sip: { headers } } });

test('Context Init (voice) parses the CXone headers', async () => {
    const h = makeCognigy({
        channel: 'voice',
        inputData: voiceInput({
            'X-CXone': '{"customerName":"ACME"}',
            'X-CXone-Custom': JSON.stringify({ ivaParams: '{"tier":"gold"}' }),
            'X-CXone-Extended': '{"voiceSkillId":"vs1"}',
            'X-InContact-MasterId': 55,
            'X-InContact-ContactId': 66
        })
    });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.strictEqual(h.context.data.customerName, 'ACME');
    assert.strictEqual(h.context.data.voiceSkillId, 'vs1');
    assert.strictEqual(h.context.data.flowChannel, 'VOICE');
    assert.strictEqual(h.context.data.contactId, '55');
    assert.strictEqual(h.context.data.spawnedContactId, '66');
    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('Context Init (voice) trims identifiers coming from SIP headers', async () => {
    const h = makeCognigy({
        channel: 'voice',
        inputData: voiceInput({ 'X-CXone': '{}', 'X-InContact-MasterId': ' 55 ', 'X-InContact-ContactId': ' 66 ' })
    });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.strictEqual(h.context.data.contactId, '55');
    assert.strictEqual(h.context.data.spawnedContactId, '66');
});

test('Context Init always leaves an ivaParams object behind', async () => {
    const h = makeCognigy({ channel: 'voice', inputData: voiceInput({ 'X-CXone': '{"customerName":"ACME"}' }) });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.deepStrictEqual(h.context.data.ivaParams, {}, 'downstream flows read context.data.ivaParams');
});

test('Context Init (chat) parses ivaParams without mutating input.data', async () => {
    const inputData = { contactId: '77', ivaParams: '{"tier":"gold"}' };
    const h = makeCognigy({ channel: 'webchat', inputData });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
    assert.strictEqual(typeof inputData.ivaParams, 'string', 'input.data must not be modified');
});

test('Context Init (chat) defaults ivaParams and survives invalid JSON', async () => {
    let h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77' } });
    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });
    assert.deepStrictEqual(h.context.data.ivaParams, {});

    h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ivaParams: 'not json' } });
    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });
    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('Context Init falls back to defaults for Testchat', async () => {
    const h = makeCognigy({ channel: 'testchat' });

    await setCxoneContextInit.function({
        cognigy: h.cognigy,
        config: { customerName: ' ACME ', businessNumber: ' 4597359 ', ivaParams: '{"tier":"gold"}' }
    });

    assert.strictEqual(h.context.data.contactId, '100000000000');
    assert.strictEqual(h.context.data.customerName, 'ACME');
    assert.strictEqual(h.context.data.ocpSessionId, '4597359:100000000000');
    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('Context Init does not re-initialise an existing context', async () => {
    const h = makeCognigy({ channel: 'voice', contextData: { contactId: 'already-set' }, inputData: voiceInput({ 'X-CXone': '{"customerName":"NEW"}' }) });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.strictEqual(h.context.data.contactId, 'already-set');
    assert.strictEqual(h.context.data.customerName, undefined);
});

test('Context Init survives a missing voice payload', async () => {
    const h = makeCognigy({ channel: 'voice', inputData: {} });

    await assert.doesNotReject(() => setCxoneContextInit.function({ cognigy: h.cognigy, config: {} }));
    assert.match(h.context.setCxoneContextInit, /Voice input data not available/);
});

test('identifiers are trimmed before they reach a CXone URL', async () => {
    const cxone = mockCxone();
    await signal(makeCognigy({}), { contactId: ' 9001 ' });

    assert.ok(apiCalls(cxone).some(c => c.includes('/interactions/9001/signal')), apiCalls(cxone).join('\n'));
});

test('Context Init keeps the caller phone number out of the logs', async () => {
    const h = makeCognigy({
        channel: 'voice',
        inputData: voiceInput({ 'X-CXone': '{"customerName":"ACME","ani":"+15551234567"}' })
    });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.strictEqual(h.context.data.ani, '+15551234567', 'the flow still gets the real value');
    assert.ok(!h.logText().includes('+15551234567'), 'the caller number must not be logged');
    assert.match(h.logText(), /ani redacted/);
});

test('Context Init (chat) keeps the caller phone number out of the logs', async () => {
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ani: '+15559876543' } });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.strictEqual(h.context.data.ani, '+15559876543');
    assert.ok(!h.logText().includes('+15559876543'));
});
