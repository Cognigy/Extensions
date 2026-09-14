// Textel SMS/MMS: phone number formatting, attachment validation, error handling and privacy.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { sendTextelMms } = require(path.join(__dirname, '..', 'build', 'nodes', 'send-sms.js'));

const TEXTEL_URL = 'https://foundation.textel.net/clientapi/v1/message/send';

function makeCognigy() {
    const context = {};
    const logs = [];
    const outputs = [];
    const api = {
        log: (level, message) => logs.push({ level, message }),
        addToContext: (key, value) => { context[key] = value; },
        output: (text, data) => outputs.push({ text, data })
    };
    return {
        cognigy: { api, input: {}, context },
        context, logs, outputs,
        logText: () => logs.map(l => `${l.level}: ${l.message}`).join('\n'),
        logsAt: (level) => logs.filter(l => l.level === level).map(l => l.message)
    };
}

function mockTextel(options = {}) {
    const state = { calls: [], status: options.status || 200 };
    global.fetch = async (url, init = {}) => {
        state.calls.push({ url: String(url), headers: init.headers || {}, body: init.body ? JSON.parse(init.body) : null });
        return {
            ok: state.status < 400,
            status: state.status,
            statusText: state.status === 200 ? 'OK' : 'Error',
            json: async () => ({}),
            text: async () => '{}'
        };
    };
    return state;
}

const config = (overrides = {}) => Object.assign({
    toPhoneNumber: '5551234567',
    fromPhoneNumber: '5559876543',
    bodyText: 'your appointment is confirmed',
    connection: { token: 'textel-token' }
}, overrides);

const run = (harness, overrides) => sendTextelMms.function({ cognigy: harness.cognigy, config: config(overrides) });

test('a 10 digit US number gets the country code', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { toPhoneNumber: '(555) 123-4567', fromPhoneNumber: '555.987.6543' });

    assert.strictEqual(textel.calls[0].body.to, '+15551234567');
    assert.strictEqual(textel.calls[0].body.from, '+15559876543');
});

test('an 11 digit US number only gets the plus', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { toPhoneNumber: '15551234567' });

    assert.strictEqual(textel.calls[0].body.to, '+15551234567');
});

test('an international number is left as it is', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { toPhoneNumber: '+445551234567' });

    assert.strictEqual(textel.calls[0].body.to, '+445551234567');
});

test('the message and the Textel endpoint are sent as expected', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { bodyText: 'hello there' });

    assert.strictEqual(textel.calls[0].url, TEXTEL_URL);
    assert.strictEqual(textel.calls[0].body.body, 'hello there');
    assert.strictEqual(textel.calls[0].headers.Authorization, 'Bearer textel-token');
});

test('a valid attachment is included', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { attachmentUrl: 'https://example.test/picture.png' });

    assert.strictEqual(textel.calls[0].body.attachmentUrl, 'https://example.test/picture.png');
});

test('an attachment that is not http(s) is dropped and the builder is warned', async () => {
    const textel = mockTextel();
    const h = makeCognigy();

    await run(h, { attachmentUrl: 'javascript:alert(1)' });

    assert.strictEqual(textel.calls[0].body.attachmentUrl, undefined);
    assert.match(h.logText(), /not a valid http\(s\) URL and was ignored/);
});

test('an empty attachment field is simply an SMS', async () => {
    const textel = mockTextel();
    const h = makeCognigy();

    await run(h, { attachmentUrl: '   ' });

    assert.strictEqual(textel.calls[0].body.attachmentUrl, undefined);
    assert.ok(!h.logText().includes('was ignored'), 'an empty field is not a mistake worth warning about');
});

test('the message text is kept out of the logs', async () => {
    mockTextel();
    const h = makeCognigy();

    // deliberately not digits: the phone numbers in the log contain digit runs of their own
    await run(h, { bodyText: 'your one time code is SECRET-CODE-XYZ' });

    assert.ok(!h.logText().includes('SECRET-CODE-XYZ'), 'message content must not be logged');
    assert.match(h.logText(), /<redacted: \d+ chars>/);
});

test('a successful send is recorded in the context', async () => {
    mockTextel();
    const h = makeCognigy();

    await run(h, { toPhoneNumber: '5551234567' });

    assert.match(h.context.sendTextelMms, /Sent SMS\/MMS to 5551234567/);
});

test('missing required fields are reported to the flow, never to the customer', async () => {
    const textel = mockTextel();

    for (const missing of [{ toPhoneNumber: '' }, { fromPhoneNumber: '' }, { bodyText: '' }]) {
        const h = makeCognigy();
        await assert.rejects(() => run(h, missing), /'To', 'From' and 'Message' are all required/);
        assert.strictEqual(h.outputs.length, 0, 'nothing may be sent to the channel');
    }
    assert.strictEqual(textel.calls.length, 0, 'no request is made with an incomplete configuration');
});

test('a missing connection is reported', async () => {
    mockTextel();
    await assert.rejects(() => run(makeCognigy(), { connection: undefined }), /No connection provided/);
});

test('an attachment value that is not a URL at all is rejected, not thrown on', async () => {
    const textel = mockTextel();
    const h = makeCognigy();

    await run(h, { attachmentUrl: 'this is not a url' });

    assert.strictEqual(textel.calls[0].body.attachmentUrl, undefined);
    assert.match(h.logText(), /not a valid http\(s\) URL/);
});

test('a number that is neither 10 nor 11 digits keeps its own country code', async () => {
    const textel = mockTextel();
    await run(makeCognigy(), { toPhoneNumber: '445551234567' });

    assert.strictEqual(textel.calls[0].body.to, '+445551234567');
});

test('a Textel API failure is logged and reported without leaking details to the customer', async () => {
    mockTextel({ status: 502 });
    const h = makeCognigy();

    await assert.rejects(() => run(h), /Error calling Textel API/);

    assert.match(h.context.sendTextelMms, /Error sending SMS\/MMS/);
    const spoken = h.outputs[h.outputs.length - 1];
    assert.match(spoken.text, /Error sending SMS\/MMS to/);
    assert.strictEqual(spoken.data, null, 'internal error details must not reach the channel');
});
