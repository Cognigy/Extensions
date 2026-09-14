// Knowledge Hub: response mapping, conversational context, resilience, utterance privacy.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, KH_ANSWER } = require('./helpers/harness');

const { getKnowledgeHubInfo } = require_('nodes/knowledge-hub.js');
const formatKnowledgeHubResponse = require_('helpers/kh-response.js').default;

const silentApi = { log: () => {} };

const config = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT,
    contactId: '9001',
    businessNumber: '4597359',
    bedrockKbId: 'kb-1',
    userUtterance: 'what is my balance',
    storeLocation: 'context',
    storeKey: 'khResult',
    connection: CONNECTION
}, overrides);

const run = (harness, overrides) => getKnowledgeHubInfo.function({ cognigy: harness.cognigy, config: config(overrides) });

test('a successful answer is mapped in full', () => {
    const mapped = formatKnowledgeHubResponse(KH_ANSWER, silentApi, 200);

    assert.strictEqual(mapped.answer, 'The answer');
    assert.deepStrictEqual(mapped.links, ['link-1']);
    assert.deepStrictEqual(mapped.images, ['image-1']);
    assert.deepStrictEqual(mapped.citations, ['cite-1']);
    assert.strictEqual(mapped.contextRefId, 'ref-1');
});

test('each response code maps to its own message', () => {
    const answerFor = (code) => formatKnowledgeHubResponse({}, silentApi, code).answer;

    assert.match(answerFor(404), /unable to find/);
    assert.match(answerFor(418), /unable to find/);
    assert.match(answerFor(406), /more details/);
    assert.match(answerFor(411), /more details/);
    assert.match(answerFor(413), /shorter/);
    assert.match(answerFor(500), /retry/);
});

test('odd response bodies never throw', () => {
    assert.match(formatKnowledgeHubResponse(null, silentApi, 200).answer, /retry/);
    assert.match(formatKnowledgeHubResponse('<html>502</html>', silentApi, 200).answer, /retry/);
    assert.strictEqual(formatKnowledgeHubResponse(JSON.stringify(KH_ANSWER), silentApi, 200).answer, 'The answer');
    assert.match(formatKnowledgeHubResponse({ kbAnswers: {} }, silentApi, 200).answer, /unable to find/);
    assert.ok(formatKnowledgeHubResponse({ other: 1 }, silentApi, 200).answer);
});

test('the answer is stored and the conversation reference is persisted', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;
    const h = makeCognigy({});

    await run(h);

    assert.strictEqual(h.context.khResult.answer, 'The answer');
    assert.strictEqual(h.context.contextRefId, 'ref-1', 'the reference must survive for the next turn');
});

test('an existing conversation reference is sent back to Knowledge Hub', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;
    const h = makeCognigy({ context: { contextRefId: 'ref-earlier' } });

    await run(h);

    const sent = JSON.parse(cxone.lastInit.body);
    assert.strictEqual(sent.kbFiltering.conversationContextRefId, 'ref-earlier');
    assert.strictEqual(h.context.contextRefId, 'ref-earlier', 'an established reference is kept');
});

test('filters are accepted as an object or as a JSON string', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;

    await run(makeCognigy({}), { filters: { source: 'faq' } });
    assert.deepStrictEqual(JSON.parse(cxone.lastInit.body).kbFiltering.filters, { source: 'faq' });

    await run(makeCognigy({}), { filters: '{"source":"kb"}' });
    assert.deepStrictEqual(JSON.parse(cxone.lastInit.body).kbFiltering.filters, { source: 'kb' });
});

test('a non-JSON Knowledge Hub response degrades instead of crashing', async () => {
    const cxone = mockCxone();
    cxone.rawBody = '<html><body>502 Bad Gateway</body></html>';
    cxone.khStatus = 502;
    const h = makeCognigy({});

    await assert.doesNotReject(() => run(h));

    assert.match(h.context.khResult.answer, /retry/);
    assert.ok(h.logsAt('error').some(m => m.includes('non-JSON')));
});

test('the customer utterance stays out of the logs', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;
    const h = makeCognigy({});

    await run(h, { userUtterance: 'my card number is 4111111111111111' });

    assert.ok(!h.logText().includes('4111111111111111'), 'the utterance must never be logged');
    assert.match(h.logText(), /<redacted: \d+ chars>/);
});

test('storeLocation "input" writes to the input', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;
    const h = makeCognigy({});

    await run(h, { storeLocation: 'input' });

    assert.strictEqual(h.inputStore.khResult.answer, 'The answer');
});

test('missing configuration fails before any HTTP call', async () => {
    const cxone = mockCxone();

    await assert.rejects(() => run(makeCognigy({}), { bedrockKbId: '' }), /Missing parameters/);
    await assert.rejects(() => run(makeCognigy({}), { userUtterance: '' }), /Missing parameters/);
    await assert.rejects(() => run(makeCognigy({}), { storeKey: '' }), /Output Store Key/);
    assert.strictEqual(cxone.calls.length, 0, 'nothing may be requested before the config is valid');
});

test('a failure tells the customer nothing about the error', async () => {
    const cxone = mockCxone({ onRequest: (url) => { if (url.includes('eai-real-time-insight')) throw new Error('socket hang up'); return null; } });
    const h = makeCognigy({});

    await assert.rejects(() => run(h), /socket hang up/);

    const spoken = h.outputs[h.outputs.length - 1];
    assert.strictEqual(spoken.text, 'Something is not working. Please retry.');
    assert.strictEqual(spoken.data, null);
    assert.ok(cxone.calls.length > 0);
});
