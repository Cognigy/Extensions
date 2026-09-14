// Send Transcript to TMS: posting, the duplicate guard, and every "nothing worth posting" case.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, apiCalls, ENVIRONMENT, CONNECTION, TRANSCRIPT, transcriptItem } = require('./helpers/harness');

const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');

const config = (overrides = {}) => Object.assign({
    environment: ENVIRONMENT,
    action: 'Escalate',
    businessNumber: '4597359',
    contactId: '9001',
    connection: CONNECTION
}, overrides);

const run = (harness, overrides) => sendTranscriptToTMS.function({ cognigy: harness.cognigy, config: config(overrides) });

test('posts the transcript once and records the contact it was posted for', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 1);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedContactId, '9001');
});

test('the payload matches the TMS contract', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { action: 'Escalate' });

    const payload = cxone.tmsPayload;
    assert.strictEqual(payload.vendorId, 'Cognigy');
    assert.strictEqual(payload.busId, '4597359');
    assert.strictEqual(payload.contactId, '9001');
    assert.strictEqual(payload.contactState, 'SELF_SERVICE');
    assert.strictEqual(payload.selfServiceSessionDetails.sessionCompletionType, 'ESCALATED');
    assert.deepStrictEqual(
        payload.selfServiceSessionDetails.transcripts.map(t => [t.participantId, t.messageBody]),
        [['Patron', 'I need an agent'], ['Bot', 'Transferring you now']]
    );
    // utcDateTime carries milliseconds and no timezone suffix
    assert.match(payload.selfServiceSessionDetails.transcripts[0].utcDateTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/);
});

test('"End" is reported as a contained session', async () => {
    const cxone = mockCxone();
    await run(makeCognigy({ transcript: TRANSCRIPT }), { action: 'End' });
    assert.strictEqual(cxone.tmsPayload.selfServiceSessionDetails.sessionCompletionType, 'CONTAINED');
});

test('a second run for the same contact posts nothing', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h);
    const afterFirst = cxone.tmsCalls;
    await run(h);

    assert.strictEqual(cxone.tmsCalls, afterFirst, 'the transcript must not be posted twice');
});

test('a different contact in the same session is still posted', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h, { contactId: '9001' });
    await run(h, { contactId: '7777' });

    assert.strictEqual(cxone.tmsCalls, 2);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedContactId, '7777');
});

test('input.transcript wins over context.transcript', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({
        transcript: [transcriptItem({ payload: { text: 'from context' } })],
        inputTranscript: [transcriptItem({ payload: { text: 'from input' } })]
    });

    await run(h);

    assert.strictEqual(cxone.tmsPayload.selfServiceSessionDetails.transcripts[0].messageBody, 'from input');
});

test('no transcript: skipped, nothing posted, and the reason is logged', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({});

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'skipped');
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /No transcript available/);
});

test('a transcript that is not an array is refused with a clear message', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: 'a plain string' });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'skipped');
    assert.match(h.logText(), /not an array of conversation items \(got string\)/);
});

test('an empty transcript array is not posted', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: [] });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /Transcript is empty/);
});

test('malformed items are dropped, the good ones are still posted', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({
        transcript: [
            transcriptItem({ payload: { text: 'first' } }),
            null,
            { role: 'user', type: 'input', payload: null, timestamp: 1 },
            { role: 'user', type: 'input', payload: { text: 'no timestamp' } },
            { role: 'user', type: 'input', payload: { text: 'bad timestamp' }, timestamp: 'yesterday' },
            transcriptItem({ payload: { text: 'last' }, timestamp: 1767225605000 })
        ]
    });

    await run(h);

    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.deepStrictEqual(
        cxone.tmsPayload.selfServiceSessionDetails.transcripts.map(t => t.messageBody),
        ['first', 'last']
    );
    assert.match(h.logText(), /ignored 4 of 6 transcript item\(s\)/);
});

test('a transcript with no usable items is refused', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: [null, { payload: null, timestamp: 1 }, { payload: { text: 'x' }, timestamp: 'nope' }] });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /no usable conversation items/i);
});

test('messages without text are skipped so the CXone transcript has no blank lines', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({
        transcript: [
            transcriptItem({ role: 'user', type: 'input', payload: { text: 'I need help' } }),
            transcriptItem({ role: 'assistant', type: 'output', payload: { data: { quickReplies: [1, 2] } } }),
            transcriptItem({ role: 'assistant', type: 'output', payload: { text: 'Sure' } })
        ]
    });

    await run(h);

    assert.deepStrictEqual(
        cxone.tmsPayload.selfServiceSessionDetails.transcripts.map(t => `${t.participantId}:${t.messageBody}`),
        ['Patron:I need help', 'Bot:Sure']
    );
});

test('a transcript of only data-only messages is not posted', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({
        transcript: [
            transcriptItem({ role: 'assistant', type: 'output', payload: { data: { x: 1 } } }),
            transcriptItem({ role: 'assistant', type: 'output', payload: { text: '   ' } })
        ]
    });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 0);
    assert.match(h.context.cxoneTmsTranscriptPostedDetails, /no messages with text/i);
});

test('the Testchat placeholder contact posts nothing', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT, channel: 'testchat' });

    await run(h, { contactId: '100000000000' });

    assert.strictEqual(apiCalls(cxone).length, 0);
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'skipped');
});

test('a chat channel posts the transcript too', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT, channel: 'nice' });

    await run(h);

    assert.strictEqual(cxone.tmsCalls, 1);
});

test('a TMS failure never throws and leaves a retry possible', async () => {
    const cxone = mockCxone();
    cxone.tmsStatus = 500;
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await assert.doesNotReject(() => run(h));

    assert.strictEqual(h.context.cxoneTmsTranscriptPostedStatus, 'failed');
    assert.strictEqual(h.context.cxoneTmsTranscriptPostedContactId, undefined, 'a failed post must not claim the contact');
});

test('an authentication-sounding failure under another status is diagnosed', async () => {
    const cxone = mockCxone();
    cxone.tmsStatus = 400;
    cxone.tmsBody = { error: 'token expired' };
    const h = makeCognigy({ transcript: TRANSCRIPT });

    await run(h);

    assert.match(h.logText(), /automatic token refresh only triggers on 401\/403/);
});

test('missing configuration is reported to the flow, never to the customer', async () => {
    mockCxone();
    for (const missing of [{ contactId: '' }, { businessNumber: '' }, { action: '' }]) {
        const h = makeCognigy({ transcript: TRANSCRIPT });
        await assert.rejects(() => run(h, missing), /sendTranscriptToTMS/);
        assert.strictEqual(h.outputs.length, 0, 'nothing may be sent to the channel');
    }
});

test('Environment "Other" requires a base URL', async () => {
    mockCxone();
    const h = makeCognigy({ transcript: TRANSCRIPT });
    await assert.rejects(() => run(h, { environment: 'other', baseUrl: '  ' }), /Base URL is required/);
});
