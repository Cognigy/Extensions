// Exit Interaction: the voice signal, the TMS hand-off with Send Transcript, and the
// CXone Guide Chat payload returned to Studio.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, apiCalls, ENVIRONMENT, CONNECTION, TRANSCRIPT } = require('./helpers/harness');

const { handoverToCXone } = require_('nodes/handover.js');
const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');

const config = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT,
    action: 'Escalate',
    businessNumber: '4597359',
    contactId: '9001',
    spawnedContactId: '9002',
    optionalParamsObject: [],
    connection: CONNECTION
}, overrides);

const run = (harness, overrides) => handoverToCXone.function({ cognigy: harness.cognigy, config: config(overrides) });

const niceCXOne = (harness) => harness.outputs[0].data._cognigy._niceCXOne;

test('voice: posts the transcript and signals the spawned contact', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 1);
    assert.strictEqual(cxone.signalCalls, 1);
    assert.ok(cxone.calls.some(c => c.includes('/interactions/9002/signal?p1=Escalate')), cxone.calls.join('\n'));
    assert.match(h.context.CXoneHandover, /Signaled CXone with: 'Escalate'/);
});

test('voice: optional parameters are sent as p2', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { optionalParamsObject: [{ key: 'value' }] });

    assert.strictEqual(JSON.parse(cxone.lastInit.body).p2, '[{"key":"value"}]');
});

test('voice: optional parameters given as a JSON string are still sent', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { optionalParamsObject: '[{"key":"value"}]' });

    assert.strictEqual(JSON.parse(cxone.lastInit.body).p2, '[{"key":"value"}]');
});

test('voice: an invalid optional-parameter value is ignored, never blocking the handover', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { optionalParamsObject: 'not json' });

    assert.strictEqual(cxone.signalCalls, 1, 'the signal must still be sent');
    assert.deepStrictEqual(JSON.parse(cxone.lastInit.body), {});
    assert.match(h.logText(), /ignoring invalid value/);
});

test('voice: does not post the transcript again after Send Transcript to TMS did', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await sendTranscriptToTMS.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359', contactId: '9001', connection: CONNECTION }
    });
    assert.strictEqual(cxone.tmsCalls, 1);

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 1, 'the transcript must not be posted twice');
    assert.strictEqual(cxone.signalCalls, 1, 'the signal must still be sent');
});

test('voice: posts the transcript itself when nothing posted it yet', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { action: 'End' });

    assert.strictEqual(cxone.tmsCalls, 1);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.strictEqual(cxone.tmsPayload.selfServiceSessionDetails.sessionCompletionType, 'CONTAINED');
});

test('CXone Guide Chat: returns the _niceCXOne payload and makes no API call', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'nice', transcript: TRANSCRIPT });

    await run(h, { optionalParamsObject: [{ k: 'v' }] });

    assert.strictEqual(apiCalls(cxone).length, 0);
    const payload = niceCXOne(h);
    assert.strictEqual(payload.json.action, 'AGENT_TRANSFER');
    assert.strictEqual(payload.json.data.Intent, 'Escalate');
    assert.strictEqual(payload.json.data.Params, '[{"k":"v"}]');
    assert.strictEqual(payload.json.text, '');
});

test('CXone Guide Chat: End maps to END_CONVERSATION and omits Params', async () => {
    mockCxone();
    const h = makeCognigy({ channel: 'nice' });

    await run(h, { action: 'End' });

    const payload = niceCXOne(h);
    assert.strictEqual(payload.json.action, 'END_CONVERSATION');
    assert.deepStrictEqual(payload.json.data, { Intent: 'End' });
});

test('Testchat placeholder contacts neither signal nor output', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'testchat' });

    await run(h, { contactId: '100000000000', spawnedContactId: '100000000000' });

    assert.strictEqual(apiCalls(cxone).length, 0);
    assert.strictEqual(h.outputs.length, 0);
});

test('a TMS failure does not stop the handover signal', async () => {
    const cxone = mockCxone();
    cxone.tmsStatus = 500;
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h);

    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'failed');
    assert.strictEqual(cxone.signalCalls, 1, 'the escalation must still happen');
});

test('a missing action is reported to the flow, not to the customer', async () => {
    mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await assert.rejects(() => run(h, { action: '' }), /Missing Action parameter/);
    assert.strictEqual(h.outputs.length, 0);
});

test('a failing signal tells the customer nothing about the error', async () => {
    const cxone = mockCxone();
    cxone.signalStatus = 500;
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await assert.rejects(() => run(h));

    const spoken = h.outputs[h.outputs.length - 1];
    assert.strictEqual(spoken.text, 'Something is not working. Please retry.');
    assert.strictEqual(spoken.data, null, 'internal error details must not reach the channel');
    assert.match(h.context.CXoneHandover, /Error signaling/);
});
