// NiCEview Report Session: which sessions earn a row in the demo log, that the row is
// written once per session rather than once per turn, and that the demo-log id comes back
// into the context for a later update.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockDemoLogService } = require('./helpers/harness');

const { reportNiCEviewSession } = require_('nodes/report-session.js');

const run = (harness) => reportNiCEviewSession.function({ cognigy: harness.cognigy, config: {} });

// read from the build, so the suite never carries a copy of the real endpoint
const { DEMO_LOG_URL } = require_('helpers/secrets.local.js');
const SERVICE = `${DEMO_LOG_URL}/demo-logs/flow/`;

// A real telephony call for a normal demo - the case that is always reported
const telephony = (overrides) => Object.assign({
    flowChannel: 'VOICE',
    contactId: '9876543210',
    ani: '+15551234567',
    demoName: 'acme-bank',
    flowId: 'flow-1',
    userToken: 'token-1'
}, overrides || {});

const session = (contextData, extra) => makeCognigy(Object.assign({
    contextData,
    input: { sessionId: 'session-1', userId: 'user-1', projectId: 'project-1' }
}, extra || {}));

test('a telephony session is posted to the demo log', async () => {
    const service = mockDemoLogService();
    const h = session(telephony());

    await run(h);

    assert.strictEqual(service.calls.length, 1);
    assert.deepStrictEqual(service.calls[0].body, {
        flow_id: 'flow-1',
        flow_channel: 'VOICE',
        contact_id: '9876543210',
        session_id: 'session-1',
        cognigy_user_id: 'user-1',
        project_id: 'project-1',
        user_token: 'token-1',
        ani: '+15551234567',
        demo_name: 'acme-bank'
    });
});

test('the post carries the flow key and asks for JSON', async () => {
    const service = mockDemoLogService();
    const h = session(telephony());

    await run(h);

    const { method, headers, url } = service.calls[0];
    assert.strictEqual(method, 'POST');
    assert.strictEqual(headers['Content-Type'], 'application/json');
    assert.ok(headers['x-flow-key'], 'the service rejects a request without the flow key');
    assert.strictEqual(url, SERVICE, 'with no id yet, the report creates a new row');
});

test('the request carries a deadline, so a hung service cannot stall the demo', async () => {
    const service = mockDemoLogService();
    const h = session(telephony());

    await run(h);

    assert.ok(service.calls[0].signal, 'the fetch is given an abort signal');
});

test('an existing demo log id is appended to the URL', async () => {
    const service = mockDemoLogService();
    const h = session(telephony(), { context: { demoLogId: 'log-7' } });

    await run(h);

    assert.strictEqual(service.calls[0].url, `${SERVICE}log-7`);
});

test('the returned id is kept for a later update', async () => {
    mockDemoLogService({ response: { id: 'log-42' } });
    const h = session(telephony());

    await run(h);

    assert.strictEqual(h.context.demoLogId, 'log-42');
    assert.strictEqual(h.context.demoLogReported, true);
    assert.ok(h.context.demoLogStartedAt > 0, 'the start time is recorded for a later duration');
});

test('an id nested under result is read too', async () => {
    mockDemoLogService({ response: { length: 1, result: { id: 'log-99' }, statusCode: 200 } });
    const h = session(telephony());

    await run(h);

    assert.strictEqual(h.context.demoLogId, 'log-99');
});

test('the session is reported once, not once per turn', async () => {
    const service = mockDemoLogService();
    const h = session(telephony());

    await run(h);
    await run(h);
    await run(h);

    assert.strictEqual(service.calls.length, 1, 'the report describes the session, not the turn');
    assert.strictEqual(h.context.sessionReport, null, 'a repeat run clears the report so the flow skips the post');
});

test('web chat is reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'COGNIGY_WEBCHAT', contactId: '100000000000', ani: '' }));

    await run(h);

    assert.strictEqual(service.calls.length, 1);
    assert.strictEqual(service.calls[0].body.flow_channel, 'COGNIGY_WEBCHAT');
});

test('Guide chat is reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'CHAT' }));

    await run(h);

    assert.strictEqual(service.calls.length, 1);
});

test('a WebRTC demo is reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'VOICE', contactId: '100000000000' }));

    await run(h);

    assert.strictEqual(service.calls.length, 1);
});

test('a Test Chat run is not reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'TESTCHAT', contactId: '100000000000' }));

    await run(h);

    assert.strictEqual(service.calls.length, 0);
    assert.strictEqual(h.context.sessionReport, null);
    assert.strictEqual(h.context.demoLogReported, undefined, 'a session that was never reported stays reportable');
});

test('a session with no context data at all is not reported', async () => {
    const service = mockDemoLogService();
    const h = makeCognigy({});

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(service.calls.length, 0);
    assert.strictEqual(h.context.sessionReport, null);
});

// The AI Agent Hub is recognised by its demo name alone, and only browser channels are
// suppressed - a real call into the Hub is still a demo worth logging.

test('the AI Agent Hub is not reported on a browser channel', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'COGNIGY_WEBCHAT', demoName: 'acme_ai-agent-hub' }));

    await run(h);

    assert.strictEqual(service.calls.length, 0);
});

test('the AI Agent Hub suffix is matched regardless of case and trailing space', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'COGNIGY_WEBCHAT', demoName: '  acme_AI-Agent-Hub  ' }));

    await run(h);

    assert.strictEqual(service.calls.length, 0);
});

test('a real call into the AI Agent Hub is still reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ demoName: 'acme_ai-agent-hub' }));

    await run(h);

    assert.strictEqual(service.calls.length, 1, 'only browser channels are suppressed for the Hub');
});

test('a demo whose name merely contains the Hub marker is reported', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({ flowChannel: 'COGNIGY_WEBCHAT', demoName: 'acme_ai-agent-hub-archive' }));

    await run(h);

    assert.strictEqual(service.calls.length, 1, 'the marker only counts at the end of the name');
});

test('the user token is taken from the iva parameters when it is not on the context', async () => {
    const service = mockDemoLogService();
    const h = session(telephony({
        userToken: undefined,
        ivaParams: { contextData: { userToken: 'token-from-iva' } }
    }));

    await run(h);

    assert.strictEqual(service.calls[0].body.user_token, 'token-from-iva');
});

test('a field that arrived as an object is reported empty, not as "[object Object]"', async () => {
    const service = mockDemoLogService();
    // SIP header values are JSON: a field that should be text can arrive nested
    const h = session(telephony({ demoName: { value: 'acme' }, flowId: {}, userToken: {}, ani: {} }));

    await run(h);

    const body = service.calls[0].body;
    assert.strictEqual(body.demo_name, '');
    assert.strictEqual(body.flow_id, '');
    assert.strictEqual(body.user_token, '');
    assert.strictEqual(body.ani, '');
    assert.ok(!JSON.stringify(body).includes('[object Object]'), 'no JS junk reaches the demo log');
});

test('the dispatcher flow id wins over the one in the context data', async () => {
    const service = mockDemoLogService();
    const h = session(telephony(), { context: { demoFlowId: 'dispatched-flow' } });

    await run(h);

    assert.strictEqual(service.calls[0].body.flow_id, 'dispatched-flow');
});

test('the caller number and the user token are kept out of the logs', async () => {
    mockDemoLogService();
    const h = session(telephony());

    await run(h);

    assert.ok(!h.logText().includes('+15551234567'), 'the caller number must not be logged');
    assert.ok(!h.logText().includes('token-1'), 'the demo user token must not be logged');
    assert.match(h.logText(), /redacted/);
});

test('a failing demo-log service never breaks the demo', async () => {
    mockDemoLogService({ status: 500, rawBody: '<html>gateway error</html>' });
    const h = session(telephony());

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.demoLogStatus, 500);
    assert.strictEqual(h.context.demoLogId, undefined, 'no id was returned, so none is stored');
    assert.strictEqual(h.context.demoLogReported, true, 'a failed post is not retried on the next turn');
});

test('an unreachable demo-log service never breaks the demo', async () => {
    mockDemoLogService({ throws: 'socket hang up' });
    const h = session(telephony());

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.demoLogStatus, 0);
    assert.strictEqual(h.context.demoLogId, undefined);
});

test('a 200 that is not JSON at all is survived', async () => {
    mockDemoLogService({ status: 200, rawBody: '<html>gateway says ok</html>' });
    const h = session(telephony());

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.demoLogId, undefined, 'there is no id to be had');
    assert.strictEqual(h.context.demoLogStatus, 200);
    assert.match(h.logText(), /returned no id/);
});

test('a service that returns no id leaves the previous one alone', async () => {
    mockDemoLogService({ response: { ok: true } });
    const h = session(telephony(), { context: { demoLogId: 'log-7' } });

    await run(h);

    assert.strictEqual(h.context.demoLogId, 'log-7');
    assert.match(h.logText(), /returned no id/);
});
