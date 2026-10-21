// Every node logs the extension version first, so a Cognigy log shows which build actually ran -
// Cognigy can keep executing a cached package for a while after an update.
const test = require('node:test');
const assert = require('node:assert');
const { require_, makeCognigy, mockCxone, ENVIRONMENT, CONNECTION, TRANSCRIPT, KH_ANSWER } = require('./helpers/harness');
const { version } = require('../package.json');

const { EXTENSION_VERSION } = require_('helpers/version.js');

const NODES = [
    ['nodes/handover.js', 'handoverToCXone', 'handoverToCXone', { action: 'End', businessNumber: '4597359', contactId: '9001', spawnedContactId: '9002', optionalParamsObject: [] }],
    ['nodes/send-transcript.js', 'sendTranscriptToTMS', 'sendTranscriptToTMS', { action: 'End', businessNumber: '4597359', contactId: '9001' }],
    ['nodes/knowledge-hub.js', 'getKnowledgeHubInfo', 'getKnowledgeHubInfo', { contactId: '9001', businessNumber: '4597359', bedrockKbId: 'kb-1', userUtterance: 'q', storeLocation: 'context', storeKey: 'k' }],
    ['nodes/api-caller.js', 'cxoneApiCaller', 'cxoneApiCaller', { apiSuffix: 'svc/v1/things', method: 'GET', storeLocation: 'context', storeKey: 'k' }],
    ['nodes/send-signal.js', 'sendSignalToCXone', 'sendSignalToCXone', { contactId: '9001', signalParams: '["End"]' }],
    ['nodes/init-context.js', 'setCxoneContextInit', 'setCxoneContextInit', {}]
];

test('the version comes from package.json', () => {
    assert.strictEqual(EXTENSION_VERSION, version);
});

for (const [file, exportName, logName, config] of NODES) {
    test(`${logName} logs the extension version as its first line`, async () => {
        const cxone = mockCxone();
        cxone.khBody = KH_ANSWER;
        const h = makeCognigy({ transcript: TRANSCRIPT, inputData: {} });
        const node = require_(file)[exportName];

        await node.function({ cognigy: h.cognigy, config: Object.assign({ environment: ENVIRONMENT, connection: CONNECTION }, config) }).catch(() => {});

        assert.strictEqual(h.logs[0].message, `${logName}: CXone extension v${version}`);
        assert.ok(!h.events.some(e => /version/i.test(e)), 'the version is only logged, never written to the context');
    });
}
