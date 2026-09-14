// Shared test harness for the CXone extension.
//
// The tests exercise the COMPILED nodes in ../build, exactly as Cognigy loads them, with a fake
// Cognigy `api` object and a mocked CXone API. Run them with `npm test` (which transpiles first).

const path = require('path');

const BUILD = path.join(__dirname, '..', '..', 'build');

const require_ = (relative) => require(path.join(BUILD, relative));

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

// A token whose payload jwt.decode() can read: the nodes need iss + tenantId from the id_token.
const fakeIdToken = (iss = 'https://cxone.niceincontact.com', tenantId = 'tenant-1') =>
    `${b64url({ alg: 'none' })}.${b64url({ iss, tenantId })}.signature`;

const ENVIRONMENT = 'https://cxone.niceincontact.com';
const CONNECTION = { accessKeyId: 'key-id', accessKeySecret: 'key-secret', clientId: 'client', clientSecret: 'secret' };

const transcriptItem = (overrides = {}) => Object.assign({
    role: 'user',
    type: 'input',
    payload: { text: 'hello' },
    timestamp: 1767225600000
}, overrides);

const TRANSCRIPT = [
    transcriptItem({ role: 'user', type: 'input', payload: { text: 'I need an agent' }, timestamp: 1767225600000 }),
    transcriptItem({ role: 'assistant', type: 'output', payload: { text: 'Transferring you now' }, timestamp: 1767225601000 })
];

// A stand-in for Cognigy's node context. addToContext writes straight onto the context object,
// which is how Cognigy makes a write visible to the nodes that run after it.
function makeCognigy(options = {}) {
    const context = Object.assign({ data: options.contextData || {} }, options.context || {});
    if (options.transcript !== undefined) context.transcript = options.transcript;

    const logs = [];
    const outputs = [];
    const inputStore = {};

    const api = {
        log: (level, message) => logs.push({ level, message }),
        addToContext: (key, value) => { context[key] = value; },
        addToInput: (key, value) => { inputStore[key] = value; },
        output: (text, data) => outputs.push({ text, data })
    };

    const input = { channel: options.channel || 'voice', data: options.inputData };
    if (options.inputTranscript !== undefined) input.transcript = options.inputTranscript;

    return {
        cognigy: { api, input, context },
        context,
        logs,
        outputs,
        inputStore,
        logText: () => logs.map(l => `${l.level}: ${l.message}`).join('\n'),
        logsAt: (level) => logs.filter(l => l.level === level).map(l => l.message)
    };
}

// Installs a mocked CXone API on global.fetch and returns the recorder. Every field on the
// returned object can be changed mid-test to steer the next response.
function mockCxone(options = {}) {
    const state = {
        calls: [],              // "METHOD url" for every request
        lastInit: null,          // the fetch init of the last non-discovery request
        tokensIssued: 0,
        tmsCalls: 0,
        tmsPayload: null,        // parsed body of the last TMS post
        signalCalls: 0,
        tmsStatus: 200,
        tmsBody: { result: 'accepted' },
        signalStatus: 200,
        apiStatus: 200,
        apiBody: { hello: 'world' },
        khStatus: 200,
        khBody: null,
        // return a raw string body (to simulate a non-JSON error page)
        rawBody: null,
        // a request whose Authorization matches this value is rejected with 401
        expiredToken: null,
        apiEndpoint: 'https://api.cxone',
        onRequest: options.onRequest || null
    };

    const respond = (body, status = 200) => ({
        ok: status < 400,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        json: async () => body,
        text: async () => (typeof body === 'string' ? body : JSON.stringify(body))
    });

    global.fetch = async (url, init = {}) => {
        const target = String(url);
        state.calls.push(`${init.method || 'GET'} ${target}`);

        if (state.onRequest) {
            const custom = state.onRequest(target, init, state, respond);
            if (custom) return custom;
        }

        if (target.includes('/.well-known/openid-configuration')) {
            return respond({ token_endpoint: `${target.split('/.well-known')[0]}/auth/token` });
        }
        if (target.includes('/.well-known/cxone-configuration')) {
            const tenant = new URL(target).searchParams.get('tenantId');
            return respond({ api_endpoint: options.apiEndpointPerTenant ? `${state.apiEndpoint}-${tenant}` : state.apiEndpoint });
        }
        if (target.includes('/auth/token')) {
            state.tokensIssued += 1;
            return respond({ access_token: `TOKEN-${state.tokensIssued}`, id_token: fakeIdToken(), token_type: 'bearer' });
        }

        state.lastInit = init;
        const authorization = (init.headers || {}).Authorization;
        const tokenIsExpired = state.expiredToken && authorization === `Bearer ${state.expiredToken}`;

        if (target.includes('/aai/tms/transcripts/post')) {
            state.tmsCalls += 1;
            state.tmsPayload = init.body ? JSON.parse(init.body) : null;
            if (tokenIsExpired) return respond({ error: 'expired' }, 401);
            return respond(state.tmsBody, state.tmsStatus);
        }
        if (target.includes('/signal')) {
            state.signalCalls += 1;
            if (tokenIsExpired) return respond({ error: 'expired' }, 401);
            return respond({ result: 'signalled' }, state.signalStatus);
        }
        if (target.includes('/eai-real-time-insight/')) {
            if (tokenIsExpired) return respond({ error: 'expired' }, 401);
            if (state.rawBody !== null) return respond(state.rawBody, state.khStatus);
            return respond(state.khBody, state.khStatus);
        }

        if (tokenIsExpired) return respond({ error: 'expired' }, 401);
        if (state.rawBody !== null) return respond(state.rawBody, state.apiStatus);
        return respond(state.apiBody, state.apiStatus);
    };

    return state;
}

// Counts only the calls that went to a CXone API (not to discovery or the token endpoint).
const apiCalls = (state) => state.calls.filter(c => !c.includes('.well-known') && !c.includes('/auth/token'));

const KH_ANSWER = {
    kbAnswers: {
        kbCompletions: [{ kbCompletion: 'The answer', citations: [{ metadata: [{ Uri: 'cite-1' }] }] }],
        kbLinks: [{ link: 'link-1' }],
        kbImages: [{ uri: 'image-1' }],
        conversationContextRefId: 'ref-1'
    }
};

module.exports = {
    require_, BUILD, ENVIRONMENT, CONNECTION, TRANSCRIPT, KH_ANSWER,
    fakeIdToken, transcriptItem, makeCognigy, mockCxone, apiCalls
};
