// Shared test harness for the NiCEview extension.
//
// The tests exercise the COMPILED nodes in ../build, exactly as Cognigy loads them, with a fake
// Cognigy `api` object and a mocked NiCEview settings service. Run them with `npm test`.

const path = require('path');

const BUILD = path.join(__dirname, '..', '..', 'build');

const require_ = (relative) => require(path.join(BUILD, relative));

// A stand-in for Cognigy's node context. addToContext writes straight onto the context object,
// which is how Cognigy makes a write visible to the nodes that run after it.
function makeCognigy(options = {}) {
    const context = Object.assign({}, options.context || {});
    if (options.contextData !== undefined) context.data = options.contextData;

    const logs = [];
    const api = {
        log: (level, message) => logs.push({ level, message }),
        addToContext: (key, value) => { context[key] = value; },
        addToInput: () => {},
        output: () => {}
    };

    return {
        cognigy: { api, input: { channel: options.channel || 'voice', data: options.inputData }, context },
        context,
        logs,
        logText: () => logs.map(l => `${l.level}: ${l.message}`).join('\n'),
        logsAt: (level) => logs.filter(l => l.level === level).map(l => l.message)
    };
}

// Voice input as the SIP integration delivers it
const voiceInput = (headers) => ({ payload: { sip: { headers } } });

// Installs a mocked NiCEview settings service on global.fetch and returns the recorder.
function mockNiceviewService(options = {}) {
    const state = {
        calls: [],            // { url, body } per request
        settings: options.settings !== undefined ? options.settings : {
            agentId: 'agent-1',
            ani: '+15551234567',
            contactId: 'contact-1',
            copilotId: 'copilot-1',
            companyName: 'ACME',
            skillId: 'skill-1',
            flowId: 'flow-1',
            voiceSkillId: 'voice-1',
            invocationId: 'inv-1',
            ocpSessionId: 'ocp-1',
            customIvaJson: '{"tier":"gold"}',
            guideStyles: 'large blob',
            chatStyles: 'large blob',
            cognigyChatStyles: 'large blob'
        },
        status: options.status || 200,
        rawBody: options.rawBody !== undefined ? options.rawBody : null
    };

    global.fetch = async (url, init = {}) => {
        state.calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
        const body = state.settings === null ? { data: [] } : { data: [state.settings] };
        const text = state.rawBody !== null ? state.rawBody : JSON.stringify(body);
        return {
            ok: state.status < 400,
            status: state.status,
            statusText: state.status === 200 ? 'OK' : 'Error',
            json: async () => JSON.parse(text),
            text: async () => text
        };
    };

    return state;
}

module.exports = { require_, BUILD, makeCognigy, voiceInput, mockNiceviewService };
