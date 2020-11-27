import { INodeField, INodeSection } from "@cognigy/extension-tools/build/interfaces/descriptor";

interface IConfigParams {
    azureSpeechRecognitionMode: string;
		bargeIn: boolean;
		bargeInOnDTMF: boolean;
		bargeInMinWordCount: number;
		botFailOnErrors: boolean;
		botNoInputGiveUpTimeoutMS: number;
		botNoInputTimeoutMS: number;
		botNoInputRetries: number;
		botNoInputSpeech: string;
		botNoInputUrl: string;
		userNoInputTimeoutMS: number;
		userNoInputRetries: number;
		userNoInputSendEvent: boolean;
		userNoInputSpeech: string;
		userNoInputUrl: string;
		continuousASR: boolean;
		continuousASRDigits: string;
		continuousASRTimeoutInMS: number;
		disableTtsCache: boolean;
		googleInteractionType: string;
		language: string;
		sendDTMF: boolean;
		dtmfCollect: boolean;
		dtmfCollectInterDigitTimeoutMS: number;
		dtmfCollectMaxDigits: number;
		dtmfCollectSubmitDigit: string;
		sttContextId: string;
		sttContextPhrases: string[];
		sttContextBoost: number;
		sttDisablePunctuation: boolean;
		azureEnableAudioLogging: boolean;
		voiceName: string;
}

/**
 * Compile the active parameters from the config
 * @param config Node Config
 * @param compiledParams Compiled Parameters Object
 */
export const compileParams = (config: IConfigParams, compiledParams: Object) => {
    Object.keys(config).forEach((key) => {
        if (key !== "activityParams" && key !== "text" && key !== "setActivityParams") {
            if (!key.startsWith("dtmfCollect") || (key.startsWith("dtmfCollect") && config["dtmfCollect"])) {
                switch (typeof config[key]) {
                    case "object":
                        if (Array.isArray(config[key]) && config[key].length > 0) {
                            compiledParams[key] = config[key];
                        }
                        break;

                    case "number":
                    case "string":
                        if (config[key]) compiledParams[key] = config[key];
                        break;

                    case "boolean":
                        compiledParams[key] = config[key];
                        break;

                    default:

                }
            }
        }
    });
};

/**
 * All necessary fields for the voiceGateway parameters
 * @param condition Node Field Condition to hide fields or not, optional
 */
export const getParameterFields = (): any[] => [
    {
        key: "azureSpeechRecognitionMode",
        type: "select",
        label: "Azure STT Mode",
        description: "Defines the Azure STT recognition mode",
        defaultValue: "",
        params: {
		    options: [
                { label: "conversation (default)", value: "" },
                { label: "dictation", value: "dictation" },
                { label: "interactive", value: "interactive" },
            ]
        }
    },
    {
        key: "sttContextId",
        type: "cognigyText",
        label: "Azure STT Context ID",
        description: "Azure's Custom Speech model ID",
        defaultValue: ""
    },
    {
        key: "azureEnableAudioLogging",
        type: "toggle",
        label: "Enable Audio Logging",
        description: "Enables recording and logging of audio from the user on Azure",
        defaultValue: false,
    },

    {
        key: "bargeIn",
        type: "toggle",
        label: "Barge In",
        description: "Enables the Barge-In feature",
        defaultValue: false,
    },
    {
        key: "bargeInOnDTMF",
        type: "toggle",
        label: "Barge In on DTMF",
        description: "Enables the Barge-In on DTMFfeature",
        defaultValue: false,
    },
    {
        key: "bargeInMinWordCount",
        type: "slider",
        label: "Barge In Minimum Words",
        description: "Defines the minimum number of words that the user must say for the Voice Gateway to consider it a barge-in",
        defaultValue: 0,
		params: {
			min: 0,
			max: 5,
			step: 1,
		},
    },

    {
        key: "botFailOnErrors",
        type: "toggle",
        label: "Bot fails on Error",
        description: "Defines what happens when the Azure bot error 'retry' occurs",
        defaultValue: false,
    },
    {
        key: "botNoInputGiveUpTimeoutMS",
        type: "number",
        label: "No Flow Input Give Up Timeout",
        description: "Defines the maximum time that the VG waits for a response from the Flow and disconnects",
        defaultValue: 0,
    },
    {
        key: "botNoInputTimeoutMS",
        type: "number",
        label: "No Flow Input Timeout (ms)",
        description: "Defines the maximum time (in ms) that the VG waits for input from the Flow",
        defaultValue: 0,
    },
    {
        key: "botNoInputRetries",
        type: "number",
        label: "Flow Timeout Retries",
        description: "Defines the maximum number of allowed Flow timeouts",
        defaultValue: 0,
    },
    {
        key: "botNoInputSpeech",
        type: "cognigyText",
        label: "No Flow Input Prompt",
        description: "Defines a prompt to speak when the Flow doesn't answer",
        defaultValue: "",
    },
    {
        key: "botNoInputUrl",
        type: "cognigyText",
        label: "No Flow Input URL",
        description: "Defines a url to play when the Flow doesn't answer",
        defaultValue: "",
    },
    {
        key: "userNoInputTimeoutMS",
        type: "number",
        label: "No User Input Timeout (ms)",
        description: "Defines the maximum time (in milliseconds) that the Voice Gateway waits for input from the user",
        defaultValue: 0,
    },
    {
        key: "userNoInputRetries",
        type: "number",
        label: "No User Input Retries",
        description: "Defines the maximum number of allowed timeouts for no user input",
        defaultValue: 0,
    },
    {
        key: "userNoInputSendEvent",
        type: "toggle",
        label: "Send No User Input Event",
        description: "Send an data input to the Flow if there is no user input",
        defaultValue: false,
    },
    {
        key: "userNoInputSpeech",
        type: "cognigyText",
        label: "No User Input Prompt",
        description: "Defines a prompt to speak when the user doesn't answer",
        defaultValue: "",
    },
    {
        key: "userNoInputUrl",
        type: "cognigyText",
        label: "No User Input URL",
        description: "Defines a url to play when the user doesn't answer",
        defaultValue: "",
        condition: {
            key: "userNoInputSpeech",
            value: ""
        }
    },
    {
        key: "continuousASR",
        type: "toggle",
        label: "Enable Continuous ASR",
        description: "Enables the Continuous ASR feature",
        defaultValue: false,
    },
    {
        key: "continuousASRDigits",
        type: "cognigyText",
        label: "Continuous ASR Digits",
        description: "Defines a special DTMF key, which if pressed, causes the VG to immediately send the accumulated recognitions to the Flow",
        defaultValue: "",
        condition: {
            key: "continuousASR",
            value: true
        }
    },
    {
        key: "continuousASRTimeoutInMS",
        type: "number",
        label: "Continuous ASR Timeout",
        description: "Defines the automatic speech recognition (ASR) timeout (in milliseconds)",
        defaultValue: 0,
        condition: {
            key: "continuousASR",
            value: true
        }
    },
    {
        key: "disableTtsCache",
        type: "toggle",
        label: "Disable TTS Cache",
        description: "Disables caching of TTS (audio) results from the bot",
        defaultValue: false,
    },
    {
        key: "googleInteractionType",
        type: "select",
        label: "Google Interaction Types",
        description: "Defines the Google STT interaction type",
        defaultValue: "",
        params: {
		    options: [
                { label: "INTERACTION_TYPE_UNSPECIFIED (default)", value: "" },
                { label: "DISCUSSION", value: "DISCUSSION" },
                { label: "PRESENTATION", value: "PRESENTATION" },
                { label: "PHONE_CALL", value: "PHONE_CALL" },
                { label: "VOICEMAIL", value: "VOICEMAIL" },
                { label: "PROFESSIONALLY_PRODUCED", value: "PROFESSIONALLY_PRODUCED" },
                { label: "VOICE_SEARCH", value: "VOICE_SEARCH" },
                { label: "VOICE_COMMAND", value: "VOICE_COMMAND" },
                { label: "DICTATION", value: "DICTATION" },
            ]
        }
    },
    {
        key: "language",
        type: "cognigyText",
        label: "Language Code",
        description: "Defines the language (e.g., 'en-AU') of the TTS and STT engines",
        defaultValue: "",
    },
    {
        key: "sendDTMF",
        type: "toggle",
        label: "Send DTMF",
        description: "Enables the sending of DTMF events to the bot",
        defaultValue: false,
    },
    {
        key: "dtmfCollect",
        type: "toggle",
        label: "DTMF Collect",
        description: "The VG first collects all the DTMF digits entered by the user and sends them all together",
        defaultValue: false,
        condition: {
            key: "sendDTMF",
            value: true
        }
    },
    {
        key: "dtmfCollectInterDigitTimeoutMS",
        type: "number",
        label: "DTMF Collect Timeout",
        description: "Timeout in between collected DTMF tones",
        defaultValue: 2000,
        condition: {
            key: "dtmfCollect",
            value: true
        }
    },
    {
        key: "dtmfCollectMaxDigits",
        type: "number",
        label: "DTMF Collect Max Digits",
        description: "The maximum number of DTMF digits to expect",
        defaultValue: 5,
        condition: {
            key: "dtmfCollect",
            value: true
        }
    },
    {
        key: "dtmfCollectSubmitDigit",
        type: "cognigyText",
        label: "DTMF Collect Submit Digit",
        description: "Defines a special DTMF 'submit' digit",
        defaultValue: "#",
        condition: {
            key: "dtmfCollect",
            value: true
        }
    },
    {
        key: "sttContextPhrases",
        type: "textArray",
        label: "Google Cloud STT Context Phrases",
        description: "Controls Google Cloud STT Context Phrases",
        defaultValue: [""]
    },
    {
        key: "sttContextBoost",
        type: "number",
        label: "Google Cloud STT Context Boost",
        description: "The boost number for context recognition of the speech context phrases",
        defaultValue: 0
    },
    {
        key: "sttDisablePunctuation",
        type: "toggle",
        label: "Disable STT Punctuation",
        description: "Prevents the STT response from the bot to include punctuation marks",
        defaultValue: false,
    },

    {
        key: "voiceName",
        type: "cognigyText",
        label: "Voice Name",
        description: "Defines the voice name for the TTS service",
        defaultValue: ""
    },
];

/**
 * All necessary sections for the params
 * @param condition Node Field Condition to hide fields or not, optional
 */
export const getParamSections = (condition?): any[] => [
    {
        key: "params_azure",
        label: "Azure Configuration",
        defaultCollapsed: true,
        fields: [
            "azureSpeechRecognitionMode",
            "sttContextId",
            "azureEnableAudioLogging",
        ],
        condition
    },
    {
        key: "params_bargein",
        label: "Barge In",
        defaultCollapsed: true,
        fields: [
            "bargeIn",
            "bargeInOnDTMF",
            "bargeInMinWordCount",
        ],
        condition
    },
    {
        key: "params_bot_timeouts",
        label: "Bot Timeouts",
        defaultCollapsed: true,
        fields: [
            "botNoInputTimeoutMS",
            "botNoInputRetries",
            "botNoInputSpeech",
            "botNoInputUrl",
            "botFailOnErrors"
        ],
        condition
    },
    {
        key: "params_user_timeouts",
        label: "User Timeouts",
        defaultCollapsed: true,
        fields: [
            "userNoInputTimeoutMS",
            "userNoInputRetries",
            "userNoInputSendEvent",
            "userNoInputSpeech",
            "userNoInputUrl",
        ],
        condition
    },
    {
        key: "params_continuousasr",
        label: "Continuous ASR",
        defaultCollapsed: true,
        fields: [
            "continuousASR",
            "continuousASRDigits",
            "continuousASRTimeoutInMS",
        ],
        condition
    },
    {
        key: "params_tts",
        label: "TTS Settings",
        defaultCollapsed: true,
        fields: [
            "voiceName",
            "disableTtsCache"
        ],
        condition
    },
    {
        key: "params_stt",
        label: "STT Settings",
        defaultCollapsed: true,
        fields: [
            "language",
            "sttDisablePunctuation",
        ],
        condition
    },
    {
        key: "params_google",
        label: "Google Configuration",
        defaultCollapsed: true,
        fields: [
            "googleInteractionType",
            "sttContextPhrases",
            "sttContextBoost",
        ],
        condition
    },
    {
        key: "params_dtmf",
        label: "DTMF",
        defaultCollapsed: true,
        fields: [
            "sendDTMF",
            "dtmfCollect",
            "dtmfCollectInterDigitTimeoutMS",
            "dtmfCollectMaxDigits",
            "dtmfCollectSubmitDigit",
        ],
        condition
    }
];