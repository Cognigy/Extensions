// The shared helpers: json-field normalisation, the TMS payload builder, log redaction,
// and the duplicate guard.
const test = require('node:test');
const assert = require('node:assert');
const { require_, transcriptItem } = require('./helpers/harness');

const { parseJsonField, parseJsonObjectField, parseJsonArrayField, tryParseJsonField } = require_('helpers/json-field.js');
const transformConversation = require_('helpers/tms-payload.js').default;
const { redactTmsPayload } = require_('helpers/redact.js');
const guard = require_('helpers/tms-guard.js');

const api = { log: () => {} };

test('a json field is accepted as a parsed value or as a JSON string', () => {
    assert.deepStrictEqual(parseJsonField(api, [{ a: 1 }], 'F'), [{ a: 1 }]);
    assert.deepStrictEqual(parseJsonField(api, '[{"a":1}]', 'F'), [{ a: 1 }]);
    assert.deepStrictEqual(parseJsonField(api, '{"a":1}', 'F'), { a: 1 });
});

test('an empty json field reads as nothing, not as an error', () => {
    for (const empty of [undefined, null, '', '   ']) {
        assert.strictEqual(parseJsonField(api, empty, 'F'), undefined);
        assert.deepStrictEqual(parseJsonArrayField(api, empty, 'F'), []);
        assert.deepStrictEqual(parseJsonObjectField(api, empty, 'F'), {});
    }
});

test('an invalid json field names the field it came from', () => {
    assert.throws(() => parseJsonField(api, 'not json', 'Signal Parameters'), /Signal Parameters must be valid JSON/);
    assert.throws(() => parseJsonArrayField(api, '{"a":1}', 'Signal Parameters'), /must be a valid JSON array/);
    assert.throws(() => parseJsonObjectField(api, '[1,2]', 'Headers'), /must be a valid JSON object/);
});

test('tryParseJsonField never throws', () => {
    assert.strictEqual(tryParseJsonField(api, 'not json', 'F'), undefined);
    assert.deepStrictEqual(tryParseJsonField(api, '[1]', 'F'), [1]);
});

const rowsOf = (items) => transformConversation(items, 'End', 'contact', 'bus').selfServiceSessionDetails.transcripts;

test('messageBody is always a string on the wire', () => {
    assert.strictEqual(rowsOf([transcriptItem({ payload: { text: 42 } })])[0].messageBody, '42');
    assert.strictEqual(rowsOf([transcriptItem({ payload: { text: true } })])[0].messageBody, 'true');
    assert.strictEqual(rowsOf([transcriptItem({ payload: { text: { rich: 'card' } } })])[0].messageBody, '{"rich":"card"}');
});

test('messages that carry no text are left out of the transcript', () => {
    assert.strictEqual(rowsOf([transcriptItem({ role: 'assistant', type: 'output', payload: { data: { x: 1 } } })]).length, 0);
    assert.strictEqual(rowsOf([transcriptItem({ payload: { text: null } })]).length, 0);
    assert.strictEqual(rowsOf([transcriptItem({ payload: { text: '   ' } })]).length, 0);
});

test('roles map to the CXone participants', () => {
    const rows = rowsOf([
        transcriptItem({ role: 'user', type: 'input', payload: { text: 'a' } }),
        transcriptItem({ role: 'assistant', type: 'output', payload: { text: 'b' } })
    ]);
    assert.deepStrictEqual(rows.map(r => r.participantId), ['Patron', 'Bot']);
});

test('the session outcome follows the exit action', () => {
    const details = (action) => transformConversation([transcriptItem()], action, 'c', 'b').selfServiceSessionDetails;
    assert.strictEqual(details('End').sessionCompletionType, 'CONTAINED');
    assert.match(details('End').sessionCompletionDetails, /End Conversation/);
    assert.strictEqual(details('Escalate').sessionCompletionType, 'ESCALATED');
    assert.match(details('Escalate').sessionCompletionDetails, /Live Agent/);
});

test('redaction replaces the wording but keeps the structure', () => {
    const payload = transformConversation([transcriptItem({ payload: { text: 'my card number is 4111111111111111' } })], 'End', 'c', 'b');
    const redacted = redactTmsPayload(payload);

    assert.ok(!JSON.stringify(redacted).includes('4111111111111111'));
    assert.match(redacted.selfServiceSessionDetails.transcripts[0].messageBody, /^<redacted: \d+ chars>$/);
    assert.strictEqual(redacted.busId, 'b');
    assert.strictEqual(payload.selfServiceSessionDetails.transcripts[0].messageBody, 'my card number is 4111111111111111',
        'the original payload must not be modified');
});

test('redaction copes with payloads it does not recognise', () => {
    assert.strictEqual(redactTmsPayload(null), null);
    assert.strictEqual(redactTmsPayload('x'), 'x');
    assert.deepStrictEqual(redactTmsPayload({ a: 1 }), { a: 1 });
    assert.deepStrictEqual(redactTmsPayload({ selfServiceSessionDetails: { transcripts: 'nope' } }).selfServiceSessionDetails.transcripts, 'nope');
    assert.strictEqual(redactTmsPayload({ selfServiceSessionDetails: { transcripts: [{}] } }).selfServiceSessionDetails.transcripts[0].messageBody, '<redacted: 0 chars>');
});

test('the duplicate guard blocks only a repost for the same contact', () => {
    const posted = { cxoneTmsTranscriptPostedStatus: 'posted', cxoneTmsTranscriptPostedContactId: '9001' };

    assert.strictEqual(guard.isTmsTranscriptPosted(posted, '9001'), true);
    assert.strictEqual(guard.isTmsTranscriptPosted(posted, '7777'), false, 'another contact deserves its own transcript');
    assert.strictEqual(guard.isTmsTranscriptPosted({ cxoneTmsTranscriptPostedStatus: 'failed' }, '9001'), false);
    assert.strictEqual(guard.isTmsTranscriptPosted({ cxoneTmsTranscriptPostedStatus: 'skipped' }, '9001'), false);
    assert.strictEqual(guard.isTmsTranscriptPosted({}, '9001'), false);
});

test('a context written by an older build still blocks a repost', () => {
    // before the contact id was recorded, only the status existed
    assert.strictEqual(guard.isTmsTranscriptPosted({ cxoneTmsTranscriptPostedStatus: 'posted' }, '9001'), true);
});

test('the guard writes both the context and the in-memory copy', () => {
    const context = {};
    const writes = [];
    const localApi = { log: () => {}, addToContext: (k, v) => writes.push([k, v]) };

    guard.setTmsPostedStatus(localApi, context, 'posted', 'details here', '9001');

    assert.strictEqual(context.cxoneTmsTranscriptPostedStatus, 'posted');
    assert.strictEqual(context.cxoneTmsTranscriptPostedContactId, '9001');
    assert.ok(writes.some(([k, v]) => k === 'cxoneTmsTranscriptPostedStatus' && v === 'posted'),
        'the status must be persisted through addToContext, not only in memory');
});

test('context redaction hides the caller number without touching anything else', () => {
    const { redactContextData } = require_('helpers/redact.js');

    const data = { ani: '+15551234567', customerName: 'ACME', contactId: '9001' };
    const redacted = redactContextData(data);

    assert.match(redacted.ani, /^<redacted: \d+ chars>$/);
    assert.strictEqual(redacted.customerName, 'ACME');
    assert.strictEqual(redacted.contactId, '9001');
    assert.strictEqual(data.ani, '+15551234567', 'the original must not be modified');

    // shapes it should pass straight through
    assert.strictEqual(redactContextData(null), null);
    assert.strictEqual(redactContextData('x'), 'x');
    assert.deepStrictEqual(redactContextData({ ani: '' }), { ani: '' });
});
