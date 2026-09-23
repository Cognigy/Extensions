// NiCEview Report Session End: how long the session ran, how it ended, and closing the row
// that NiCEview Report Session opened.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockDemoLogService } = require('./helpers/harness');

const { reportNiCEviewSessionEnd } = require_('nodes/report-session-end.js');

// the node takes no configuration - Cognigy still passes an empty config object
const run = (harness) => reportNiCEviewSessionEnd.function({ cognigy: harness.cognigy, config: {} });

// read from the build, so the suite never carries a copy of the real endpoint
const { DEMO_LOG_URL } = require_('helpers/secrets.local.js');
const SERVICE = `${DEMO_LOG_URL}/demo-logs/flow/`;

// A session that was reported 5 seconds ago
const openSession = (extra) => makeCognigy({
    context: Object.assign({ demoLogId: 'log-42', demoLogStartedAt: Date.now() - 5000 }, extra || {})
});

// The measurement is taken inside the node, so a slow machine can round to the next second.
const assertAboutFiveSeconds = (seconds) =>
    assert.ok(seconds === 5 || seconds === 6, `expected about 5 seconds, got ${seconds}`);

test('the row is closed with a PUT to its own URL', async () => {
    const service = mockDemoLogService();
    const h = openSession();

    await run(h);

    assert.strictEqual(service.calls.length, 1);
    assert.strictEqual(service.calls[0].method, 'PUT');
    assert.strictEqual(service.calls[0].url, `${SERVICE}log-42`);
});

test('the PUT carries the flow key and asks for JSON', async () => {
    const service = mockDemoLogService();
    const h = openSession();

    await run(h);

    const { headers } = service.calls[0];
    assert.strictEqual(headers['Content-Type'], 'application/json');
    assert.ok(headers['x-flow-key'], 'the service rejects a request without the flow key');
});

test('the duration is measured from when the session was reported', async () => {
    const service = mockDemoLogService();
    const h = openSession();

    await run(h);

    assertAboutFiveSeconds(h.context.demoLogDuration);
    assert.strictEqual(service.calls[0].body.duration_seconds, String(h.context.demoLogDuration),
        'the service is given the recorded duration, as a string');
});

test('the outcome is taken from the context', async () => {
    const service = mockDemoLogService();
    const h = openSession({ demoLogOutcome: 'handover' });

    await run(h);

    assert.deepStrictEqual(service.calls[0].body, {
        duration_seconds: String(h.context.demoLogDuration),
        metadata: { outcome: 'handover' }
    });
    assertAboutFiveSeconds(h.context.demoLogDuration);
});

test('a whitespace-only outcome is sent as empty', async () => {
    const service = mockDemoLogService();
    const h = openSession({ demoLogOutcome: '   ' });

    await run(h);

    assert.strictEqual(service.calls[0].body.metadata.outcome, '');
});

test('an outcome that arrived as an object is sent as empty', async () => {
    const service = mockDemoLogService();
    const h = openSession({ demoLogOutcome: { value: 'handover' } });

    await run(h);

    assert.strictEqual(service.calls[0].body.metadata.outcome, '');
});

test('an unset outcome is sent as empty, not as "undefined"', async () => {
    const service = mockDemoLogService();
    const h = openSession();

    await run(h);

    assert.strictEqual(service.calls[0].body.metadata.outcome, '');
});

test('the service response is stored for the flow', async () => {
    mockDemoLogService({ response: { ok: true, id: 'log-42' } });
    const h = openSession();

    await run(h);

    assert.deepStrictEqual(h.context.demoLogResultSessionEnd, { ok: true, id: 'log-42' });
    assert.strictEqual(h.context.demoLogStatusSessionEnd, 200);
});

test('a session that was never reported is not closed', async () => {
    const service = mockDemoLogService();
    const h = makeCognigy({ context: { demoLogStartedAt: Date.now() - 5000 } });

    await run(h);

    assert.strictEqual(service.calls.length, 0, 'there is no row to close');
    assertAboutFiveSeconds(h.context.demoLogDuration); // the duration is still available to the flow
});

test('a missing start time reads as a zero duration', async () => {
    const service = mockDemoLogService();
    const h = makeCognigy({ context: { demoLogId: 'log-42' } });

    await run(h);

    assert.strictEqual(h.context.demoLogDuration, 0);
    assert.strictEqual(service.calls[0].body.duration_seconds, '0');
});

test('a start time in the future reads as zero, never as a negative', async () => {
    const service = mockDemoLogService();
    const h = openSession({ demoLogStartedAt: Date.now() + 60000 });

    await run(h);

    assert.strictEqual(h.context.demoLogDuration, 0);
    assert.strictEqual(service.calls[0].body.duration_seconds, '0');
});

test('a nonsense start time reads as zero, not as NaN', async () => {
    const service = mockDemoLogService();
    const h = openSession({ demoLogStartedAt: 'not a timestamp' });

    await run(h);

    assert.strictEqual(h.context.demoLogDuration, 0);
    assert.strictEqual(service.calls[0].body.duration_seconds, '0');
});

test('the session is closed once, not once per turn', async () => {
    const service = mockDemoLogService();
    const h = openSession();

    await run(h);
    const closedAfter = h.context.demoLogDuration;
    await run(h);
    await run(h);

    assert.strictEqual(service.calls.length, 1, 'a session ends once');
    assert.strictEqual(h.context.demoLogDuration, closedAfter, 'the recorded duration is the one measured at the close');
    assert.strictEqual(h.context.demoLogEndReported, true);
});

test('a session with no row to close can still be closed later', async () => {
    const service = mockDemoLogService();
    const h = makeCognigy({ context: { demoLogStartedAt: Date.now() - 5000 } });

    await run(h);
    assert.strictEqual(service.calls.length, 0);
    assert.strictEqual(h.context.demoLogEndReported, undefined, 'nothing was closed, so nothing is guarded');

    // the report node catches up and provides the id
    h.context.demoLogId = 'log-42';
    await run(h);

    assert.strictEqual(service.calls.length, 1);
});

test('a failing demo-log service never breaks the demo', async () => {
    mockDemoLogService({ status: 500, rawBody: '<html>gateway error</html>' });
    const h = openSession();

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.demoLogStatusSessionEnd, 500);
    assertAboutFiveSeconds(h.context.demoLogDuration); // recorded whatever the service does
});

test('an unreachable demo-log service never breaks the demo', async () => {
    mockDemoLogService({ throws: 'socket hang up' });
    const h = openSession();

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.demoLogStatusSessionEnd, 0);
});
