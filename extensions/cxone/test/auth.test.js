// Authentication: token/URL caching per environment and tenant, and the refresh-and-retry-once
// behaviour when CXone rejects a token.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, TRANSCRIPT, KH_ANSWER } = require('./helpers/harness');

const utils = require_('helpers/cxone-utils.js');
const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');
const { handoverToCXone } = require_('nodes/handover.js');
const { cxoneApiCaller } = require_('nodes/api-caller.js');
const { getKnowledgeHubInfo } = require_('nodes/knowledge-hub.js');

const GOV = 'https://cxone-gov.niceincontact.com';

test('the token URL is cached per environment', async () => {
    mockCxone();
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    const first = await utils.getCxoneOpenIdUrl(api, context, ENVIRONMENT);
    const cached = await utils.getCxoneOpenIdUrl(api, context, ENVIRONMENT);
    const other = await utils.getCxoneOpenIdUrl(api, context, GOV);

    assert.strictEqual(first, cached);
    assert.ok(other.includes('gov'), 'a different environment must be resolved again, not served from cache');
});

test('the API endpoint is cached per tenant', async () => {
    mockCxone({ apiEndpointPerTenant: true });
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    const tenantA = await utils.getCxoneConfigUrl(api, context, ENVIRONMENT, 'tenant-A');
    const tenantAagain = await utils.getCxoneConfigUrl(api, context, ENVIRONMENT, 'tenant-A');
    const tenantB = await utils.getCxoneConfigUrl(api, context, ENVIRONMENT, 'tenant-B');

    assert.strictEqual(tenantA, tenantAagain);
    assert.notStrictEqual(tenantA, tenantB, 'api_endpoint is tenant specific');
    assert.ok(tenantB.endsWith('tenant-B'));
});

test('a bearer token is never reused across environments', async () => {
    mockCxone();
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    const prod = await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);
    const prodAgain = await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);
    const gov = await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${GOV}/auth/token`);

    assert.strictEqual(prod.access_token, prodAgain.access_token, 'the cached token is reused');
    assert.notStrictEqual(prod.access_token, gov.access_token, 'another environment must issue its own token');
});

test('the cached token is stored encrypted and the access key never lands in the context', async () => {
    mockCxone();
    const h = makeCognigy({});

    await utils.getToken(h.cognigy.api, h.cognigy.context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);

    const serialized = JSON.stringify(h.context);
    assert.ok(h.context.cxoneEncryptedToken, 'the token is cached');
    assert.ok(!serialized.includes('TOKEN-1'), 'the raw token must not be readable in the context');
    assert.ok(!serialized.includes('key-id'), 'the access key id must not be stored');
});

test('an expired token is refreshed and the TMS post retried once', async () => {
    const cxone = mockCxone();
    cxone.expiredToken = 'TOKEN-1';
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await sendTranscriptToTMS.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, action: 'End', businessNumber: '4597359', contactId: '9001', connection: CONNECTION }
    });

    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.strictEqual(cxone.tmsCalls, 2, 'one rejected attempt, one successful retry');
    assert.strictEqual(cxone.tokensIssued, 2, 'exactly one extra token');
});

test('a token refused forever is retried only once, then reported', async () => {
    const cxone = mockCxone({ onRequest: (url, init, state, respond) =>
        url.includes('tms/transcripts/post') ? (state.tmsCalls++, respond({ error: 'expired' }, 401)) : null });
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await sendTranscriptToTMS.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, action: 'End', businessNumber: '4597359', contactId: '9001', connection: CONNECTION }
    });

    assert.strictEqual(cxone.tmsCalls, 2, 'no retry loop');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'failed');
});

test('Exit Interaction refreshes once for both of its calls', async () => {
    const cxone = mockCxone();
    cxone.expiredToken = 'TOKEN-1';
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await handoverToCXone.function({
        cognigy: h.cognigy,
        config: {
            environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359',
            contactId: '9001', spawnedContactId: '9002', optionalParamsObject: [], connection: CONNECTION
        }
    });

    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.strictEqual(cxone.signalCalls, 2, 'the signal retried as well');
    assert.strictEqual(cxone.tokensIssued, 2, 'the refreshed token is shared by both calls');
});

test('the API Caller retries after a rejected token', async () => {
    const cxone = mockCxone();
    cxone.expiredToken = 'TOKEN-1';
    const h = makeCognigy({});

    await cxoneApiCaller.function({
        cognigy: h.cognigy,
        config: { environment: ENVIRONMENT, apiSuffix: 'svc/v1/x', method: 'GET', storeLocation: 'context', storeKey: 'out', connection: CONNECTION }
    });

    assert.strictEqual(h.context.CXoneApiCallerStatus, 200);
    assert.deepStrictEqual(h.context.out, { hello: 'world' });
});

test('Knowledge Hub retries after a rejected token', async () => {
    const cxone = mockCxone();
    cxone.expiredToken = 'TOKEN-1';
    cxone.khBody = KH_ANSWER;
    const h = makeCognigy({});

    await getKnowledgeHubInfo.function({
        cognigy: h.cognigy,
        config: {
            environment: ENVIRONMENT, contactId: '9001', businessNumber: '4597359', bedrockKbId: 'kb-1',
            userUtterance: 'hello', storeLocation: 'context', storeKey: 'kh', connection: CONNECTION
        }
    });

    assert.strictEqual(h.context.kh.answer, 'The answer');
});
