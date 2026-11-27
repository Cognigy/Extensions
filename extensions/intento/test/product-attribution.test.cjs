const assert = require('node:assert/strict');
const { test } = require('node:test');
const axios = require('axios');
const { translateTextNode } = require('../build/nodes/translate');
const { langDetectNode } = require('../build/nodes/langdetect');

const cases = [
    {
        name: 'translation',
        node: translateTextNode,
        url: 'https://syncwrapper.inten.to/ai/text/translate',
        config: { sourceLanguage: 'en', targetLanguage: 'de', routing: 'best' },
        response: { results: ['Hallo'], id: 'test-operation' },
        result: ['Hallo'],
    },
    {
        name: 'language detection',
        node: langDetectNode,
        url: 'https://api.inten.to/ai/text/detect-language',
        config: { provider: 'ai.text.detect-language.microsoft.text_analytics_api.2-1' },
        response: { results: [[{ language: 'de', confidence: 1 }]] },
        result: 'de',
    },
];

for (const example of cases) {
    test(`${example.name} identifies Cognigy on the initial request and retry`, async (t) => {
        const requests = [];
        const results = [];
        const originalAdapter = axios.defaults.adapter;
        t.after(() => { axios.defaults.adapter = originalAdapter; });
        t.mock.method(globalThis, 'setTimeout', (callback) => { callback(); });
        axios.defaults.adapter = async (config) => {
            requests.push(config);
            if (requests.length === 1) {
                throw new Error('Temporary transport failure');
            }
            return {
                data: example.response,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        await example.node.function({
            cognigy: { api: { addToInput: (key, value) => results.push([key, value]) } },
            config: {
                connection: { key: 'test-api-key' },
                text: 'Hello',
                storeLocation: 'input',
                inputKey: 'result',
                ...example.config,
            },
        });

        assert.deepEqual(results, [['result', example.result]]);
        assert.equal(requests.length, 2);
        for (const request of requests) {
            assert.equal(request.url, example.url);
            assert.equal(request.headers.get('apikey'), 'test-api-key');
            assert.match(request.headers.get('User-Agent'), /^Intento\.CognigyTransformer\/\S+$/);
        }
    });
}
