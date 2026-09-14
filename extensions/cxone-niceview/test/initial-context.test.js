// NiCEview Init: parsing the SIP headers (including the wrapped ivaParams shapes), the chat
// input path, and the service fallback when header data is missing.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, voiceInput, mockNiceviewService } = require('./helpers/harness');

const { setNiCEviewContextInit } = require_('nodes/initial-context.js');

const run = (harness) => setNiCEviewContextInit.function({ cognigy: harness.cognigy, config: {} });

// Headers that are complete, so the node never calls the settings service
const completeHeaders = (custom) => ({
    'X-NiCEview': '{"customerName":"ACME","userToken":"token-1","demoName":"demo-1"}',
    'X-NiCEview-Custom': JSON.stringify({ ivaParams: custom }),
    'X-NiCEview-Extended': '{"voiceSkillId":"voice-1"}'
});

test('voice: ivaParams wrapped as {value: "<json>"} is unwrapped', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders({ value: '{"tier":"gold"}' })) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('voice: ivaParams as a JSON string is parsed', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders('{"tier":"silver"}')) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'silver' });
});

test('voice: ivaParams already parsed is passed through', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders({ tier: 'bronze' })) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'bronze' });
});

test('voice: an unparsable ivaParams degrades to an empty object', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders('not json at all')) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('voice: ivaParams always exists, even with no custom header', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput({ 'X-NiCEview': '{"customerName":"ACME"}' }) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {}, 'flows read context.data.ivaParams directly');
});

test('voice: the header values are merged and the channel is flagged', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders({ tier: 'gold' })) });

    await run(h);

    assert.strictEqual(h.context.data.customerName, 'ACME');
    assert.strictEqual(h.context.data.voiceSkillId, 'voice-1');
    assert.strictEqual(h.context.data.flowChannel, 'VOICE');
});

test('voice: the inContact ids are copied as trimmed strings', async () => {
    mockNiceviewService();
    const headers = Object.assign(completeHeaders({ tier: 'gold' }), {
        'X-InContact-MasterId': 42,
        'X-InContact-ContactId': ' 43 '
    });
    const h = makeCognigy({ inputData: voiceInput(headers) });

    await run(h);

    assert.strictEqual(h.context.data.contactId, '42');
    assert.strictEqual(h.context.data.spawnedContactId, '43');
});

test('voice: a missing SIP payload is reported without throwing', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: {} });

    await assert.doesNotReject(() => run(h));

    assert.match(h.context.setNiCEviewContextInit, /Voice input data not available/);
    assert.strictEqual(h.context.data, undefined);
});

test('voice: missing header data is filled in from the settings service', async () => {
    const service = mockNiceviewService();
    // no Custom/Extended headers -> the node falls back to the service
    const h = makeCognigy({ inputData: voiceInput({ 'X-NiCEview': '{"userToken":"token-1","demoName":"demo-1"}' }) });

    await run(h);

    assert.strictEqual(service.calls.length, 1, 'the settings service is called once');
    assert.deepStrictEqual(service.calls[0].body.params, ['token-1', 'demo-1']);
    assert.strictEqual(h.context.data.agentId, 'agent-1');
    assert.strictEqual(h.context.data.flowId, 'flow-1');
    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('voice: a failing settings service never clobbers good header values', async () => {
    const service = mockNiceviewService();
    service.status = 500;
    const h = makeCognigy({ inputData: voiceInput({ 'X-NiCEview': '{"customerName":"FROM-HEADER","userToken":"t","demoName":"d"}' }) });

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.data.customerName, 'FROM-HEADER');
    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('voice: the service is skipped without a token and demo name', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput({ 'X-NiCEview': '{"customerName":"ACME"}' }) });

    await run(h);

    assert.strictEqual(service.calls.length, 0);
});

test('chat: ivaParams is parsed without modifying input.data', async () => {
    mockNiceviewService();
    const inputData = { contactId: '77', ivaParams: '{"tier":"gold"}' };
    const h = makeCognigy({ channel: 'webchat', inputData });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
    assert.strictEqual(h.context.data.contactId, '77');
    assert.strictEqual(typeof inputData.ivaParams, 'string', 'input.data must not be mutated');
});

test('chat: ivaParams defaults to an empty object', async () => {
    mockNiceviewService();
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77' } });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('chat: an already parsed ivaParams object is kept', async () => {
    mockNiceviewService();
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ivaParams: { tier: 'gold' } } });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('chat: an unparsable ivaParams degrades to an empty object', async () => {
    mockNiceviewService();
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ivaParams: 'not json' } });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('no usable input at all is reported, not thrown', async () => {
    mockNiceviewService();
    const h = makeCognigy({ channel: 'webchat', inputData: undefined });

    await assert.doesNotReject(() => run(h));

    assert.match(h.context.SetNiCEviewContextInit, /No valid data found/);
});

test('voice: an empty ivaParams string is treated as no parameters', async () => {
    mockNiceviewService();
    const h = makeCognigy({ inputData: voiceInput(completeHeaders('   ')) });

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {});
});

test('voice: a custom header without an ivaParams key falls back to the service', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({
        inputData: voiceInput({
            'X-NiCEview': '{"userToken":"token-1","demoName":"demo-1"}',
            'X-NiCEview-Custom': JSON.stringify({ somethingElse: true }),
            'X-NiCEview-Extended': '{"voiceSkillId":"voice-1"}'
        })
    });

    await run(h);

    assert.strictEqual(service.calls.length, 1, 'missing parameters trigger the service lookup');
    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('voice: an unparsable custom header falls back to the service', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({
        inputData: voiceInput({
            'X-NiCEview': '{"userToken":"token-1","demoName":"demo-1"}',
            'X-NiCEview-Custom': 'not json at all',
            'X-NiCEview-Extended': '{"voiceSkillId":"voice-1"}'
        })
    });

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(service.calls.length, 1);
    assert.strictEqual(h.context.data.flowChannel, 'VOICE');
});

test('voice: the caller phone number is kept out of the logs', async () => {
    mockNiceviewService();
    const headers = completeHeaders({ tier: 'gold' });
    headers['X-NiCEview'] = '{"customerName":"ACME","ani":"+15551234567"}';
    const h = makeCognigy({ inputData: voiceInput(headers) });

    await run(h);

    assert.strictEqual(h.context.data.ani, '+15551234567', 'the flow still gets the real value');
    assert.ok(!h.logText().includes('+15551234567'), 'the caller number must not be logged');
    assert.match(h.logText(), /ani redacted/);
});

test('chat: the caller phone number is kept out of the logs', async () => {
    mockNiceviewService();
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ani: '+15559876543' } });

    await run(h);

    assert.strictEqual(h.context.data.ani, '+15559876543');
    assert.ok(!h.logText().includes('+15559876543'));
});
