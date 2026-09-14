// Media type: TMS records whether the transcript came from a voice or a digital interaction.
// "Auto" follows the Cognigy channel; an explicit setting always wins.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, TRANSCRIPT } = require('./helpers/harness');

const { sendTranscriptToTMS } = require_('nodes/send-transcript.js');
const { handoverToCXone } = require_('nodes/handover.js');
const { resolveMediaType } = require_('helpers/tms-payload.js');

test('auto maps a voice channel to Voice and everything else to Digital', () => {
    for (const channel of ['voice', 'Voice', 'voicegateway', 'AudioCodes-Voice']) {
        assert.strictEqual(resolveMediaType(channel), 'Voice', channel);
    }
    for (const channel of ['webchat', 'nice', 'testchat', 'facebook', '', undefined]) {
        assert.strictEqual(resolveMediaType(channel), 'Digital', String(channel));
    }
});

test('an explicit setting overrides the channel', () => {
    assert.strictEqual(resolveMediaType('webchat', 'Voice'), 'Voice');
    assert.strictEqual(resolveMediaType('voice', 'Digital'), 'Digital');
});

test('anything other than Voice or Digital falls back to auto', () => {
    assert.strictEqual(resolveMediaType('voice', 'auto'), 'Voice');
    assert.strictEqual(resolveMediaType('webchat', 'auto'), 'Digital');
    assert.strictEqual(resolveMediaType('webchat', ''), 'Digital');
    assert.strictEqual(resolveMediaType('webchat', 'nonsense'), 'Digital');
});

const post = (harness, overrides = {}) => sendTranscriptToTMS.function({
    cognigy: harness.cognigy,
    config: Object.assign({
        environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359',
        contactId: '9001', connection: CONNECTION
    }, overrides)
});

test('a chat interaction is posted as Digital', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'nice', transcript: TRANSCRIPT });

    await post(h);

    assert.strictEqual(cxone.tmsPayload.mediaType, 'Digital');
});

test('a voice interaction is posted as Voice', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'voice', transcript: TRANSCRIPT });

    await post(h);

    assert.strictEqual(cxone.tmsPayload.mediaType, 'Voice');
});

test('the builder can force the media type', async () => {
    let cxone = mockCxone();
    let h = makeCognigy({ channel: 'webchat', transcript: TRANSCRIPT });
    await post(h, { mediaType: 'Voice' });
    assert.strictEqual(cxone.tmsPayload.mediaType, 'Voice', 'an explicit Voice wins over a chat channel');

    cxone = mockCxone();
    h = makeCognigy({ channel: 'voice', transcript: TRANSCRIPT });
    await post(h, { mediaType: 'Digital' });
    assert.strictEqual(cxone.tmsPayload.mediaType, 'Digital', 'an explicit Digital wins over a voice channel');
});

test('the media type decision is logged', async () => {
    mockCxone();
    const h = makeCognigy({ channel: 'webchat', transcript: TRANSCRIPT });

    await post(h);

    assert.match(h.logText(), /media type: Digital \(setting: auto; channel: webchat\)/);
});

test('Exit Interaction posts Voice, since it only reaches TMS on the voice path', async () => {
    const cxone = mockCxone();
    const h = makeCognigy({ channel: 'voice', transcript: TRANSCRIPT });

    await handoverToCXone.function({
        cognigy: h.cognigy,
        config: {
            environment: ENVIRONMENT, action: 'Escalate', businessNumber: '4597359',
            contactId: '9001', spawnedContactId: '9002', optionalParamsObject: [], connection: CONNECTION
        }
    });

    assert.strictEqual(cxone.tmsPayload.mediaType, 'Voice');
});

test('the media type field offers exactly the values TMS accepts', () => {
    const field = sendTranscriptToTMS.fields.find(f => f.key === 'mediaType');
    assert.ok(field, 'the node exposes a Media Type field');
    assert.strictEqual(field.defaultValue, 'auto');
    assert.deepStrictEqual(field.params.options.map(o => o.value), ['auto', 'Voice', 'Digital']);
});
