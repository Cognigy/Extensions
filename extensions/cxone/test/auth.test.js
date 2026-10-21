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

test('the token is cached in the extension memory - never in the context, so later nodes and sessions reuse it', async () => {
    const cxone = mockCxone();
    const first = makeCognigy({});
    const later = makeCognigy({}); // e.g. Exit Interaction after Knowledge Hub, or another session

    const a = await utils.getToken(first.cognigy.api, first.cognigy.context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);
    const b = await utils.getToken(later.cognigy.api, later.cognigy.context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);

    assert.strictEqual(a.access_token, b.access_token, 'the cached token is reused');
    assert.strictEqual(cxone.tokensIssued, 1);
    assert.deepStrictEqual(first.events, [], 'caching costs no Cognigy API calls');
    const serialized = JSON.stringify(first.context);
    assert.ok(!serialized.includes('TOKEN-1'), 'the token never lands in the context');
    assert.ok(!serialized.includes('key-id'), 'the access key id never lands in the context');
});

test('a token response without an access token is reported, and never cached', async () => {
    let calls = 0;
    mockCxone({
        onRequest: (target, init, state, respond) => {
            if (!target.includes('/auth/token')) return null;
            calls += 1;
            return calls === 1 ? respond({ error: 'unexpected' }) : respond('<html>Bad Gateway</html>');
        }
    });
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    await assert.rejects(() => utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`),
        /did not contain an access token/);
    await assert.rejects(() => utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`),
        /not valid JSON/, 'a gateway error page is reported plainly, and the earlier failure was not cached');
    assert.strictEqual(calls, 2);
});

test('a token is reused for the same credentials only', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);
    await utils.getToken(api, context, 'basic', 'key-id', 'rotated-secret', `${ENVIRONMENT}/auth/token`);
    await utils.getToken(api, context, 'basic', 'other-key', 'secret', `${ENVIRONMENT}/auth/token`);

    assert.strictEqual(cxone.tokensIssued, 3, 'a rotated secret or another key never gets a cached token');
});

test('a cached token is not reused past the lifetime CXone gave it', async () => {
    const cxone = mockCxone({
        onRequest: (target, init, state, respond) => {
            if (!target.includes('/auth/token')) return null;
            state.tokensIssued += 1;
            // expires_in below the safety margin: the token must never be served from the cache
            return respond({ access_token: `TOKEN-${state.tokensIssued}`, id_token: 'x.e30.y', expires_in: 30 });
        }
    });
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);
    await utils.getToken(api, context, 'basic', 'key-id', 'secret', `${ENVIRONMENT}/auth/token`);

    assert.strictEqual(cxone.tokensIssued, 2);
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

test('the caches are bounded: past 50 entries the oldest is dropped, recent ones stay cached', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});
    const { api, context } = h.cognigy;
    const issuer = (i) => `https://env-${i}.example`;
    const discoveryCalls = () => cxone.calls.filter(c => c.includes('openid-configuration')).length;

    for (let i = 0; i < 51; i++) await utils.getCxoneOpenIdUrl(api, context, issuer(i));
    assert.strictEqual(discoveryCalls(), 51);

    await utils.getCxoneOpenIdUrl(api, context, issuer(50));
    assert.strictEqual(discoveryCalls(), 51, 'the newest entry is still cached');

    await utils.getCxoneOpenIdUrl(api, context, issuer(0));
    assert.strictEqual(discoveryCalls(), 52, 'the oldest entry was evicted and is fetched again');
});

test('a failed discovery is reported with its status and never cached', async () => {
    let fail = true;
    const cxone = mockCxone({
        onRequest: (url, init, state, respond) => url.includes('cxone-configuration') && fail ? respond({ error: 'down' }, 503) : null
    });
    const h = makeCognigy({});
    const { api, context } = h.cognigy;

    await assert.rejects(() => utils.getCxoneConfigUrl(api, context, ENVIRONMENT, 'tenant-1'), /Error getting endpoint URL: 503/);
    fail = false;
    assert.ok(await utils.getCxoneConfigUrl(api, context, ENVIRONMENT, 'tenant-1'), 'the next call resolves it');
    assert.strictEqual(cxone.calls.filter(c => c.includes('cxone-configuration')).length, 2);
});
