// CXone API Caller: json-field handling, optional bodies, HTTP status visibility, validation.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, apiCalls, ENVIRONMENT, CONNECTION } = require('./helpers/harness');

const { cxoneApiCaller } = require_('nodes/api-caller.js');

const config = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT,
    apiSuffix: 'svc/v1/things',
    method: 'GET',
    storeLocation: 'context',
    storeKey: 'apiResult',
    connection: CONNECTION
}, overrides);

const run = (harness, overrides) => cxoneApiCaller.function({ cognigy: harness.cognigy, config: config(overrides) });

test('additional headers arrive as a JSON object (a Cognigy json field)', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});

    await run(h, { method: 'POST', headers: { 'X-Foo': 'bar' }, body: { a: 1 } });

    assert.strictEqual(cxone.lastInit.headers['X-Foo'], 'bar');
    assert.strictEqual(cxone.lastInit.body, '{"a":1}');
});

test('additional headers arrive as a JSON string', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({}), { method: 'POST', headers: '{"X-Foo":"bar"}', body: '{"a":1}' });

    assert.strictEqual(cxone.lastInit.headers['X-Foo'], 'bar');
    assert.strictEqual(cxone.lastInit.body, '{"a":1}');
});

test('non-string header values are serialized', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({}), { headers: { 'X-Retry': 3 } });

    assert.strictEqual(cxone.lastInit.headers['X-Retry'], '3');
});

test('invalid header JSON is rejected with a message naming the field', async () => {
    mockCxone();
    await assert.rejects(() => run(makeCognigy({}), { headers: 'not json' }), /Additional Headers must be valid JSON/);
    await assert.rejects(() => run(makeCognigy({}), { headers: '[1,2]' }), /must be a valid JSON object/);
});

test('a custom Authorization header overrides the CXone token', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({}), { headers: { Authorization: 'Bearer MINE' } });

    assert.strictEqual(cxone.lastInit.headers.Authorization, 'Bearer MINE');
});

test('POST without a body is allowed', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({}), { method: 'POST' });

    assert.strictEqual(cxone.lastInit.body, undefined);
});

test('POST with an explicit empty object sends {}', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({}), { method: 'POST', body: {} });

    assert.strictEqual(cxone.lastInit.body, '{}');
});

test('PUT, PATCH and DELETE send the body and store the response', async () => {
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
        const cxone = mockCxone();
        const h = makeCognigy({});

        await run(h, { method, body: { a: 1 } });

        assert.strictEqual(cxone.lastInit.method, method);
        assert.strictEqual(cxone.lastInit.body, '{"a":1}');
        assert.deepStrictEqual(h.context.apiResult, { hello: 'world' });
    }
});

test('a body configured on a GET is dropped, with a warning', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});

    await run(h, { method: 'GET', body: { a: 1 } });

    assert.strictEqual(cxone.lastInit.body, undefined);
    assert.match(h.logText(), /GET requests are sent without one/);
});

test('the HTTP status is always published so a flow can branch on failures', async () => {
    const cxone = mockCxone();
    cxone.apiStatus = 503;
    const h = makeCognigy({});

    await run(h);

    assert.strictEqual(h.context.CXoneApiCallerStatus, 503);
    assert.ok(h.logsAt('error').some(m => m.includes('503')), 'a failed call must be logged as an error');
    assert.deepStrictEqual(h.context.apiResult, { hello: 'world' }, 'the body is still stored');
});

test('a non-JSON response body is stored as text', async () => {
    const cxone = mockCxone();
    cxone.rawBody = '<html>hello</html>';
    const h = makeCognigy({});

    await run(h);

    assert.strictEqual(h.context.apiResult, '<html>hello</html>');
});

test('the response body is not written to the log', async () => {
    const cxone = mockCxone();
    cxone.apiBody = { secret: 'customer-record-12345' };
    const h = makeCognigy({});

    await run(h);

    assert.ok(!h.logText().includes('customer-record-12345'), 'response content must stay out of the logs');
    assert.match(h.logText(), /Size: \d+ chars/);
});

test('storeLocation "input" writes to the input', async () => {
    mockCxone();
    const h = makeCognigy({});

    await run(h, { storeLocation: 'input' });

    assert.deepStrictEqual(h.inputStore.apiResult, { hello: 'world' });
});

test('missing configuration fails before any HTTP call is made', async () => {
    const cxone = mockCxone();
    await assert.rejects(() => run(makeCognigy({}), { apiSuffix: '   ' }), /'API Suffix \/ Endpoint' is required/);
    await assert.rejects(() => run(makeCognigy({}), { storeKey: '' }), /'Output Store Key' is required/);
    assert.strictEqual(cxone.calls.length, 0);
});

test('the URL is assembled cleanly from padded values', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});

    await run(h, { environment: 'other', baseUrl: '  https://my.cxone.example///  ', apiSuffix: '  /svc/v1/x  ' });

    assert.strictEqual(cxone.calls[0], 'GET https://my.cxone.example/.well-known/openid-configuration');
    assert.strictEqual(apiCalls(cxone).pop(), 'GET https://api.cxone/svc/v1/x');
});

test('a transport failure tells the customer nothing about the error', async () => {
    const cxone = mockCxone({ onRequest: (url) => { if (url.includes('svc/v1')) throw new Error('socket hang up'); return null; } });
    const h = makeCognigy({});

    await assert.rejects(() => run(h), /socket hang up/);

    const spoken = h.outputs[h.outputs.length - 1];
    assert.strictEqual(spoken.data, null);
    assert.strictEqual(h.context.CXoneApiCallerError, 'socket hang up');
    assert.ok(cxone.calls.length > 0);
});
