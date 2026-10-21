// Cognigy: "Extensions can make up to 10 API calls per execution, except for api.log()". A node
// that goes over is cut off mid-run - in 1.2.1 to 1.2.3 production logs, Exit Interaction stopped
// right after posting the transcript, while it was writing the TMS guard, so the lines that follow
// (the signal, the CXoneHandover write) never appeared.
//
// The documentation does not say whether "execution" means one node or the whole flow execution,
// and in production another extension node (NiCEview's Report Session End, 4 calls) runs in the
// same flow execution right before Exit Interaction. So every node stays within a budget that
// leaves room for that: 5 calls, even in its worst case - a cold start (nothing cached) whose first
// token is rejected, so the node also has to refresh it, and where the CXone call then fails.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, TRANSCRIPT, KH_ANSWER } = require('./helpers/harness');

const { handoverToCXone } = require_('nodes/handover.js');
const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');
const { getKnowledgeHubInfo } = require_('nodes/knowledge-hub.js');
const { cxoneApiCaller } = require_('nodes/api-caller.js');
const { sendSignalToCXone } = require_('nodes/send-signal.js');
const { setCxoneContextInit } = require_('nodes/init-context.js');

const BUDGET = 5;

// a cold session whose first token is rejected by CXone
const coldSessionWithExpiredToken = (options = {}) => {
    const cxone = mockCxone();
    cxone.expiredToken = 'TOKEN-1';
    cxone.khBody = KH_ANSWER;
    return { cxone, h: makeCognigy(options) };
};

const assertWithinBudget = (h, node) => {
    assert.ok(h.events.length <= BUDGET, `${node} made ${h.events.length} Cognigy API calls (budget ${BUDGET}): ${h.events.join(', ')}`);
};

const exitConfig = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359',
    contactId: '9001', spawnedContactId: '9002', optionalParamsObject: [], connection: CONNECTION
}, overrides);

test('Exit Interaction (voice): signals, posts the transcript and records both, within budget', async () => {
    const { cxone, h } = coldSessionWithExpiredToken({ transcript: TRANSCRIPT });

    await handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig() });

    assertWithinBudget(h, 'Exit Interaction');
    assert.ok(cxone.signalCalls >= 1, 'the signal is sent');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.match(h.context.CXoneHandover, /Signaled CXone with: 'Escalate'/, 'the write after the signal still happens');
});

test('Exit Interaction stays within budget when the signal fails', async () => {
    const { cxone, h } = coldSessionWithExpiredToken({ transcript: TRANSCRIPT });
    cxone.signalStatus = 500;

    await assert.rejects(() => handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig({ action: 'End' }) }), /Error sending signal/);

    assertWithinBudget(h, 'Exit Interaction (signal failed)');
    assert.match(h.context.CXoneHandover, /Error signaling CXone/, 'the failure is still recorded for the flow');
    assert.strictEqual(h.outputs.length, 1, 'the customer gets the generic message');
    const last = h.logs[h.logs.length - 1].message;
    assert.strictEqual(last, `handoverToCXone: finished, used ${h.events.length} of 10 Cognigy API calls`, 'the total is logged even when the node fails');
});

test('the counting view still answers "in" checks for the real api and cognigy objects', async () => {
    const { instrumentNode } = require_('helpers/version.js');
    const seen = {};
    const node = instrumentNode('probe', {
        type: 'probe',
        function: async ({ cognigy }) => {
            seen.apiHasLog = 'log' in cognigy.api;
            seen.apiHasAddToContext = 'addToContext' in cognigy.api;
            seen.apiHasMissing = 'notAnApiFunction' in cognigy.api;
            seen.cognigyHasContext = 'context' in cognigy;
        }
    });
    mockCxone();

    await node.function({ cognigy: makeCognigy({}).cognigy });

    assert.deepStrictEqual(seen, { apiHasLog: true, apiHasAddToContext: true, apiHasMissing: false, cognigyHasContext: true });
});

test('Exit Interaction stays within budget when TMS and the signal both fail', async () => {
    const { cxone, h } = coldSessionWithExpiredToken({ transcript: TRANSCRIPT });
    cxone.signalStatus = 500;
    cxone.tmsStatus = 500;

    await assert.rejects(() => handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig() }));

    assertWithinBudget(h, 'Exit Interaction (TMS and signal failed)');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'failed');
});

test('Exit Interaction (CXone Guide Chat) stays within budget', async () => {
    mockCxone();
    const h = makeCognigy({ channel: 'rest' });

    await handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig({ optionalParamsObject: [{ a: 1 }] }) });

    assertWithinBudget(h, 'Exit Interaction (chat)');
    assert.strictEqual(h.outputs.length, 1);
});

test('Send Transcript to TMS stays within budget', async () => {
    const { h } = coldSessionWithExpiredToken({ transcript: TRANSCRIPT });

    await sendTranscriptToTMS.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, action: 'End', businessNumber: '4597359', contactId: '9001', connection: CONNECTION }
    });

    assertWithinBudget(h, 'Send Transcript to TMS');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
});

test('Knowledge Hub stays within budget, and keeps the conversation reference', async () => {
    const { h } = coldSessionWithExpiredToken({});

    await getKnowledgeHubInfo.function({
        cognigy: h.cognigy,
        config: {
            environment: ENVIRONMENT, contactId: '9001', businessNumber: '4597359', bedrockKbId: 'kb-1',
            userUtterance: 'what is my balance', storeLocation: 'context', storeKey: 'khResult', connection: CONNECTION
        }
    });

    assertWithinBudget(h, 'Knowledge Hub');
    assert.strictEqual(h.context.khResult.answer, 'The answer');
    assert.strictEqual(h.context.contextRefId, 'ref-1');
});

test('API Caller stays within budget', async () => {
    const { h } = coldSessionWithExpiredToken({});

    await cxoneApiCaller.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, apiSuffix: 'svc/v1/things', method: 'GET', storeLocation: 'context', storeKey: 'apiResult', connection: CONNECTION }
    });

    assertWithinBudget(h, 'API Caller');
    assert.strictEqual(h.context.CXoneApiCallerStatus, 200);
});

test('Signal Interaction stays within budget', async () => {
    const { cxone, h } = coldSessionWithExpiredToken({});

    await sendSignalToCXone.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, contactId: '9001', signalParams: '["Escalate"]', connection: CONNECTION }
    });

    assertWithinBudget(h, 'Signal Interaction');
    assert.ok(cxone.signalCalls >= 1, 'the signal is sent');
});

test('Context Init stays within budget', async () => {
    mockCxone();
    const h = makeCognigy({ inputData: { contactId: '77' }, channel: 'rest' });

    await setCxoneContextInit.function({ cognigy: h.cognigy, config: {} });

    assertWithinBudget(h, 'Context Init');
});

test('no node keeps a cache in the context, or assigns to the context directly', async () => {
    const { h } = coldSessionWithExpiredToken({ transcript: TRANSCRIPT });

    await handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig() });

    const keys = h.events.map(e => e.split(' ')[1] || '');
    assert.ok(!keys.some(k => /token|url|cache/i.test(k)), `no cache writes expected: ${h.events.join(', ')}`);
    assert.ok(!h.events.some(e => e.startsWith('assign ') || e.startsWith('delete ')), `no direct context writes expected: ${h.events.join(', ')}`);
});

test('the cache is shared by later nodes: Exit Interaction after Knowledge Hub fetches nothing again', async () => {
    const cxone = mockCxone();
    cxone.khBody = KH_ANSWER;

    await getKnowledgeHubInfo.function({
        cognigy: makeCognigy({}).cognigy,
        config: {
            environment: ENVIRONMENT, contactId: '9001', businessNumber: '4597359', bedrockKbId: 'kb-1',
            userUtterance: 'q', storeLocation: 'context', storeKey: 'k', connection: CONNECTION
        }
    });
    const discoveryAndTokenCalls = () => cxone.calls.filter(c => c.includes('.well-known') || c.includes('/auth/token')).length;
    const afterKnowledgeHub = discoveryAndTokenCalls();

    await handoverToCXone.function({ cognigy: makeCognigy({ transcript: TRANSCRIPT }).cognigy, config: exitConfig() });

    assert.strictEqual(afterKnowledgeHub, 3, 'token URL, token and API URL are fetched once');
    assert.strictEqual(discoveryAndTokenCalls(), afterKnowledgeHub, 'Exit Interaction reuses all three');
});

test('a refresh that fails drops the rejected token, so the next node never reuses it', async () => {
    const cxone = mockCxone({
        // the token endpoint works once (the cold start), then refuses once
        onRequest: (target, init, state, respond) => {
            if (target.includes('/auth/token') && state.tokensIssued === 1 && !state.refused) {
                state.refused = true;
                return respond({ error: 'down' }, 500);
            }
        }
    });
    cxone.expiredToken = 'TOKEN-1';
    const config = { environment: ENVIRONMENT, action: 'End', businessNumber: '4597359', contactId: '9001', connection: CONNECTION };

    const first = makeCognigy({ transcript: TRANSCRIPT });
    await sendTranscriptToTMS.function({ cognigy: first.cognigy, config });
    assert.strictEqual(first.context.cxoneTmsTranscriptPostedStatus, 'failed');
    assertWithinBudget(first, 'Send Transcript to TMS (refresh failed)');

    const next = makeCognigy({ transcript: TRANSCRIPT });
    await sendTranscriptToTMS.function({ cognigy: next.cognigy, config });
    assert.strictEqual(cxone.tokensIssued, 2, 'the next node asks for a new token instead of reusing TOKEN-1');
    assert.strictEqual(next.context.cxoneTmsTranscriptPostedStatus, 'posted');
});

test('counting works even if Cognigy hands the node frozen api and cognigy objects', async () => {
    mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });
    const frozen = Object.freeze({ ...h.cognigy, api: Object.freeze({ ...h.cognigy.api }) });

    await handoverToCXone.function({ cognigy: frozen, config: exitConfig() });

    assert.match(h.context.CXoneHandover, /Signaled CXone/);
    assert.ok(h.logs.some(l => /finished, used 4 of 10 Cognigy API calls/.test(l.message)), h.logText());
});

test('every node logs its version, each counted call, and the total it used', async () => {
    mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await handoverToCXone.function({ cognigy: h.cognigy, config: exitConfig() });

    const messages = h.logs.map(l => l.message);
    const callLines = messages.filter(m => /^handoverToCXone: Cognigy API call \d+ of 10 \(/.test(m));
    assert.strictEqual(callLines.length, h.events.length, 'one log line per counted call');
    assert.ok(callLines.every(m => !m.includes('Signaled CXone')), 'only the kind of call and its key are logged, never the value');
    assert.strictEqual(messages[messages.length - 1], `handoverToCXone: finished, used ${h.events.length} of 10 Cognigy API calls`);
});
