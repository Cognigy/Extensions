// NiCEview Fallback node and the settings service helper.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockNiceviewService } = require('./helpers/harness');

const { setNiCEviewContextFallback } = require_('nodes/fallback-context.js');
const { getNiCEviewData } = require_('helpers/services.js');

const config = (overrides = {}) => Object.assign({
    userToken: 'token-1',
    demoSource: 'Last Saved',
    settingName: ''
}, overrides);

const run = (harness, overrides) => setNiCEviewContextFallback.function({ cognigy: harness.cognigy, config: config(overrides) });

const field = (key) => setNiCEviewContextFallback.fields.find(f => f.key === key);

test('"Last Saved Demo" is the default source, so only the token is needed', () => {
    assert.strictEqual(field('demoSource').defaultValue, 'Last Saved');
    assert.deepStrictEqual(field('settingName').condition, { key: 'demoSource', value: 'Demo Name' },
        'the demo name is only shown when it is actually used');
});

test('fills the context from the last saved demo', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({});

    await run(h);

    assert.strictEqual(service.calls.length, 1);
    assert.ok(service.calls[0].url.includes('proc=getCurrentSettingByToken'), service.calls[0].url);
    assert.deepStrictEqual(service.calls[0].body.params, ['token-1'], 'the demo name is not sent for "Last Saved"');
    assert.strictEqual(h.context.data.flowId, 'flow-1');
    assert.strictEqual(h.context.data.customerName, 'ACME');
    assert.strictEqual(h.context.data.flowChannel, 'TESTCHAT');
    assert.deepStrictEqual(h.context.data.ivaParams, { tier: 'gold' });
});

test('a named demo is requested read-only, with the name', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({});

    await run(h, { demoSource: 'Demo Name', settingName: 'demo-1' });

    assert.ok(service.calls[0].url.includes('proc=getSettingReadOnly'), service.calls[0].url);
    assert.deepStrictEqual(service.calls[0].body.params, ['token-1', 'demo-1']);
});

test('an existing context is left alone', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({ contextData: { flowId: 'already-set' } });

    await run(h);

    assert.strictEqual(service.calls.length, 0);
    assert.strictEqual(h.context.data.flowId, 'already-set');
});

test('a missing user token is reported clearly and nothing is written', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({});

    await run(h, { userToken: '   ' });

    assert.strictEqual(service.calls.length, 0);
    assert.strictEqual(h.context.data, undefined);
    assert.match(h.context.SetNiCEviewContextFallback, /'User Token' is required/);
});

test('a named demo without a name is reported clearly, not as a crash', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({});

    await run(h, { demoSource: 'Demo Name', settingName: '' });

    assert.strictEqual(service.calls.length, 0);
    assert.match(h.context.SetNiCEviewContextFallback, /'Demo Name' is required/);
});

test('a failing service is reported without throwing', async () => {
    const service = mockNiceviewService();
    service.status = 500;
    const h = makeCognigy({});

    await assert.doesNotReject(() => run(h));

    assert.match(h.context.SetNiCEviewContextFallback, /Error setting context data/);
    assert.ok(h.logsAt('error').length > 0, 'the failure is logged at error level');
});

test('an unparsable customIvaJson falls back to an empty object', async () => {
    const service = mockNiceviewService();
    service.settings = Object.assign({}, service.settings, { customIvaJson: 'not json' });
    const h = makeCognigy({});

    await run(h);

    assert.deepStrictEqual(h.context.data.ivaParams, {});
    assert.strictEqual(h.context.data.flowId, 'flow-1', 'the rest of the settings still arrive');
});

test('the service returns the settings row and hides the large style blobs from the log', async () => {
    const service = mockNiceviewService();
    const h = makeCognigy({});

    const settings = await getNiCEviewData(h.cognigy.api, 'token-1', 'demo-1', false);

    assert.strictEqual(settings.flowId, 'flow-1');
    assert.strictEqual(settings.guideStyles, 'large blob', 'the caller still gets the full row');
    assert.ok(!h.logText().includes('large blob'), 'style blobs must not be logged');
    assert.ok(service.calls[0].url.startsWith('https://'));
});

test('the service reports an empty result as an empty object', async () => {
    mockNiceviewService({ settings: null });
    const h = makeCognigy({});

    const settings = await getNiCEviewData(h.cognigy.api, 'token-1', 'demo-1', false);

    assert.deepStrictEqual(settings, {});
});

test('the service throws on an HTTP error so the caller can report it', async () => {
    mockNiceviewService({ status: 503 });
    const h = makeCognigy({});

    await assert.rejects(() => getNiCEviewData(h.cognigy.api, 'token-1', 'demo-1', false), /HTTP error fetching demo settings/);
    assert.ok(h.logsAt('error').length > 0, 'the error is logged at error level, not as info');
});

test('a non-JSON service response is reported clearly', async () => {
    mockNiceviewService({ rawBody: '<html><body>502 Bad Gateway</body></html>' });
    const h = makeCognigy({});

    await assert.rejects(() => getNiCEviewData(h.cognigy.api, 'token-1', 'demo-1', false),
        /returned a non-JSON response/);
});

test('the fallback node survives a non-JSON service response', async () => {
    mockNiceviewService({ rawBody: 'not json' });
    const h = makeCognigy({});

    await assert.doesNotReject(() => run(h));

    assert.match(h.context.SetNiCEviewContextFallback, /Error setting context data/);
    assert.strictEqual(h.context.data, undefined);
});
