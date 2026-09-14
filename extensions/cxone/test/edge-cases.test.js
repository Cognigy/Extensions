// Paths that the other test files leave untouched: discovery and token failures, the refresh that
// itself fails, Environment "Other" in every node, malformed SIP headers, and the ivaParams shapes.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, TRANSCRIPT, KH_ANSWER } = require('./helpers/harness');

const utils = require_('helpers/cxone-utils.js');
const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');
const { handoverToCXone } = require_('nodes/handover.js');
const { sendSignalToCXone } = require_('nodes/send-signal.js');
const { getKnowledgeHubInfo } = require_('nodes/knowledge-hub.js');
const { setCxoneContextInit } = require_('nodes/init-context.js');

const voiceInput = (headers) => ({ payload: { sip: { headers } } });

const postTranscript = (h, overrides = {}) => sendTranscriptToTMS.function({
    cognigy: h.cognigy,
    config: Object.assign({ environment: ENVIRONMENT, action: 'End', businessNumber: '4597359', contactId: '9001', connection: CONNECTION }, overrides)
});

const handover = (h, overrides = {}) => handoverToCXone.function({
    cognigy: h.cognigy,
    config: Object.assign({
        environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359',
        contactId: '9001', spawnedContactId: '9002', optionalParamsObject: [], connection: CONNECTION
    }, overrides)
});

const signal = (h, overrides = {}) => sendSignalToCXone.function({
    cognigy: h.cognigy,
    config: Object.assign({ environment: ENVIRONMENT, contactId: '9001', signalParams: '["Escalate"]', connection: CONNECTION }, overrides)
});

const knowledgeHub = (h, overrides = {}) => getKnowledgeHubInfo.function({
    cognigy: h.cognigy,
    config: Object.assign({
        environment: ENVIRONMENT, contactId: '9001', businessNumber: '4597359', bedrockKbId: 'kb-1',
        userUtterance: 'hello', storeLocation: 'context', storeKey: 'kh', connection: CONNECTION
    }, overrides)
});

test('a token endpoint failure is reported with its status', async () => {
    mockCxone({ onRequest: (url, init, state, respond) => url.includes('/auth/token') ? respond({ error: 'nope' }, 500) : null });
    const h = makeCognigy({});

    await assert.rejects(
        () => utils.getToken(h.cognigy.api, h.cognigy.context, 'basic', 'key-id', 'secret', ENVIRONMENT + '/auth/token'),
        /Error getting bearer token: 500/);
});

test('a discovery response missing its expected field is reported clearly', async () => {
    mockCxone({ onRequest: (url, init, state, respond) => url.includes('openid-configuration') ? respond({ nothing: true }) : null });
    let h = makeCognigy({});
    await assert.rejects(() => utils.getCxoneOpenIdUrl(h.cognigy.api, h.cognigy.context, ENVIRONMENT),
        /Token Endpoint URL not found/);

    mockCxone({ onRequest: (url, init, state, respond) => url.includes('cxone-configuration') ? respond({ nothing: true }) : null });
    h = makeCognigy({});
    await assert.rejects(() => utils.getCxoneConfigUrl(h.cognigy.api, h.cognigy.context, ENVIRONMENT, 'tenant-1'),
        /API endpoint not found/);
});

test('a non-JSON discovery response says so instead of failing on a parse error', async () => {
    mockCxone({ onRequest: (url, init, state, respond) => url.includes('openid-configuration') ? respond('<html>proxy</html>') : null });
    const h = makeCognigy({});

    await assert.rejects(() => utils.getCxoneOpenIdUrl(h.cognigy.api, h.cognigy.context, ENVIRONMENT),
        /the response was not valid JSON/);
    assert.ok(h.logsAt('error').some(m => m.includes('expected JSON but got')));
});

test('a signal failure is reported with its status', async () => {
    mockCxone({ onRequest: (url, init, state, respond) => url.includes('/signal') ? respond({ error: 'bad' }, 500) : null });
    const h = makeCognigy({});

    await assert.rejects(() => utils.sendSignal(h.cognigy.api, 'https://api.cxone', 'TOKEN', '9001', ['Escalate']),
        /Error sending signal: 500/);
});

test('when the token cannot be refreshed, the original rejection is reported', async () => {
    let tokenCalls = 0;
    const cxone = mockCxone({
        onRequest: (url, init, state, respond) => {
            if (url.includes('/auth/token')) {
                tokenCalls += 1;
                return tokenCalls > 1 ? respond({ error: 'token service down' }, 500) : null;
            }
            if (url.includes('tms/transcripts/post')) {
                state.tmsCalls += 1;
                return respond({ error: 'expired' }, 401);
            }
            return null;
        }
    });
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await postTranscript(h);

    assert.strictEqual(cxone.tmsCalls, 1, 'no retry is attempted without a fresh token');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'failed');
    assert.ok(h.logsAt('error').some(m => m.includes('Could not refresh the CXone token')));
});

test('every node validates and normalises Environment "Other"', async () => {
    const cases = [
        ['Exit Interaction', (h, o) => handover(h, o), /handoverToCXone: Base URL is required/],
        ['Signal Interaction', (h, o) => signal(h, o), /sendSignalToCXone: Base URL is required/],
        ['Knowledge Hub', (h, o) => knowledgeHub(h, o), /getKnowledgeHubInfo: Base URL is required/],
        ['Send Transcript', (h, o) => postTranscript(h, o), /sendTranscriptToTMS: Base URL is required/]
    ];

    for (const [label, call, expected] of cases) {
        const cxone = mockCxone();
        cxone.khBody = KH_ANSWER;

        await assert.rejects(() => call(makeCognigy({ transcript: TRANSCRIPT }), { environment: 'other', baseUrl: '   ' }),
            expected, label);

        await call(makeCognigy({ transcript: TRANSCRIPT }), { environment: 'other', baseUrl: '  https://my.cxone.example///  ' });
        assert.strictEqual(cxone.calls[0], 'GET https://my.cxone.example/.well-known/openid-configuration', label);
    }
});

test('every node reports a missing connection before doing anything', async () => {
    for (const call of [handover, signal, knowledgeHub, postTranscript]) {
        const cxone = mockCxone();
        await assert.rejects(() => call(makeCognigy({ transcript: TRANSCRIPT }), { connection: undefined }), /Connection not found/);
        assert.strictEqual(cxone.calls.length, 0);
    }
});

test('Exit Interaction still escalates when there is nothing to post', async () => {
    // a transcript whose only message carries no text
    let cxone = mockCxone();
    let h = makeCognigy({ transcript: [{ role: 'assistant', type: 'output', payload: { data: { x: 1 } }, timestamp: 1767225600000 }] });

    await handover(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /no messages with text/i);
    assert.strictEqual(cxone.signalCalls, 1, 'the escalation must not depend on the transcript');

    // no transcript at all
    cxone = mockCxone();
    h = makeCognigy({});

    await handover(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /No transcript available/);
    assert.strictEqual(cxone.signalCalls, 1);
});

test('Context Init accepts ivaParams in every shape the header can carry', async () => {
    const shapes = [
        ['JSON string', '{"tier":"gold"}'],
        ['wrapped in {value}', { value: '{"tier":"gold"}' }],
        ['already an object', { tier: 'gold' }]
    ];

    for (const [label, ivaParams] of shapes) {
        const h = makeCognigy({
            channel: 'voice',
            inputData: voiceInput({ 'X-CXone': '{"customerName":"ACME"}', 'X-CXone-Custom': JSON.stringify({ ivaParams }) })
        });

        await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

        assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' }, 'shape: ' + label);
    }
});

test('Context Init degrades an unusable ivaParams to an empty object', async () => {
    for (const ivaParams of ['not json', '', '   ', 42, null, ['a']]) {
        const h = makeCognigy({
            channel: 'voice',
            inputData: voiceInput({ 'X-CXone': '{}', 'X-CXone-Custom': JSON.stringify({ ivaParams }) })
        });

        await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

        assert.deepStrictEqual(h.context.data.ivaParams, {}, 'value: ' + JSON.stringify(ivaParams));
    }
});

test('Context Init reports malformed headers and never throws', async () => {
    const h = makeCognigy({
        channel: 'voice',
        inputData: voiceInput({
            'X-CXone': '{"customerName":"ACME"}',
            'X-CXone-Custom': 'this is not json at all',
            'X-CXone-Extended': 'neither is this'
        })
    });

    await assert.doesNotReject(() => setCxoneContextInit.function({ cognigy: h.cognigy, config: {} }));

    assert.strictEqual(h.context.data.customerName, 'ACME', 'the valid header still applies');
    assert.deepStrictEqual(h.context.data.ivaParams, {});
    assert.ok(h.logsAt('warn').some(m => m.includes('X-CXone-Custom')));
    assert.ok(h.logsAt('warn').some(m => m.includes('X-CXone-Extended')));
});

test('the chat path accepts ivaParams wrapped in {value} as well', async () => {
    mockCxone();
    const h = makeCognigy({ channel: 'webchat', inputData: { contactId: '77', ivaParams: { value: '{"tier":"silver"}' } } });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'silver' });
});

test('Context Init survives an unparsable X-CXone header and still sets the channel', async () => {
    const h = makeCognigy({ channel: 'voice', inputData: voiceInput({ 'X-CXone': 'not json at all' }) });

    await assert.doesNotReject(() => setCxoneContextInit.function({ cognigy: h.cognigy, config: {} }));

    assert.strictEqual(h.context.data.flowChannel, 'VOICE', 'the flow still gets a usable context');
    assert.deepStrictEqual(h.context.data.ivaParams, {});
    assert.ok(h.logsAt('error').some(m => m.includes('Error parsing X-CXone headers')));
});

test('optional parameters that are valid JSON but not an array are ignored with a warning', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await handover(h, { optionalParamsObject: { key: 'value' } });

    assert.deepStrictEqual(JSON.parse(cxone.lastInit.body), {}, 'no p2 is sent');
    assert.strictEqual(cxone.signalCalls, 1);
    assert.ok(h.logsAt('warn').some(m => m.includes('is not a JSON array')));
});

test('a failing discovery request is reported with its status', async () => {
    mockCxone({ onRequest: (url, init, state, respond) => url.includes('openid-configuration') ? respond({ error: 'down' }, 503) : null });
    const h = makeCognigy({});

    await assert.rejects(() => utils.getCxoneOpenIdUrl(h.cognigy.api, h.cognigy.context, ENVIRONMENT),
        /Error getting token URL: 503/);
});
