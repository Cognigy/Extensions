// This code is generated!
export default {
bridge,[object Object]    forward: {
inputDestinationNumberDescription,[object Object]        inputDestinationNumberLabel: {
default,Destination Phone Number            de_DE: "Ziel-Rufnummer",

        },
        nodeLabel: {
default,Forward Call            de_DE: "Anruf weiterleiten",

        },
        nodeSummary: {
default,Forward the call to a different destination            de_DE: "Anruf an ein anderes Ziel weiterleiten",

        },
        sectionAdditionalDataLabel: {
default,Data            de_DE: "Daten",

        },
        sectionAdditionalSettingsLabel: {
default,Additional Settings            de_DE: "Zusätzliche Einstellungen",

        },
        sectionCallLabel: {
default,Call Settings            de_DE: "Anruf-Einstellungen",

        },
        sectionGeneralLabel: {
default,General Settings            de_DE: "Allgemeine Einstellungen",

        },

    },
    multipleChoicePrompt: {
inputChoicesDescription,[object Object]        inputChoicesLabel: {
default,Choices            de_DE: "Auswahlmöglichkeiten",

        },
        nodeLabel: {
default,Get Multiple Choice Answer from Caller            de_DE: "Multiple-Choice-Antwort von dem:der Anrufer:in erhalten",

        },
        nodeSummary: {
default,Say something to the call with a multiple choice prompt            de_DE: "Dem:Der Anrufer:in etwas mit einer Multiple-Choice-Aufforderung sagen",

        },
        sectionChoicesSectionLabel: {
default,Choices            de_DE: "Auswahlmöglichkeiten",

        },

    },
    outboundService: {
nodeLabel,[object Object]
    },
    play: {
inputBargeInDescription,[object Object]        inputUrlLabel: {
default,Audio URL            de_DE: "Audio-URL",

        },
        inputUrlLabelDescription: {
default,Enter the location of the audio file. 
Allowed formats: Linear PCM with signed 16 bits (8 kHz or 16 kHz), A-law or µ-law 8 kHz.            de_DE: "Geben Sie den Speicherort für die Audiodatei ein. Erlaubte Formate: Linear-PCM mit vorzeichenbehafteten 16 Bit (8 kHz oder 16 kHz), A-law oder µ-law 8 kHz.",

        },
        nodeLabel: {
default,Play Audio File            de_DE: "Audiodatei abspielen",

        },
        nodeSummary: {
default,Play an audio file to the call            de_DE: "Audiodatei für den Anruf abspielen",

        },

    },
    promptForNumber: {
inputMaxDigitsDescription,[object Object]        nodeLabel: {
default,Get Number from Caller
        },
        nodeSummary: {
default,Say something to the call with a prompt to enter a number
        },

    },
    recordingStart: {
inputMaxDurationDescription,[object Object]        inputMaxDurationLabel: {
default,Maximum Call Recording Duration (s)            de_DE: "Maximale Dauer der Gesprächsaufzeichnung",

        },
        inputSpeakersLabel: {
default,Speakers to record            de_DE: "Aufzuzeichnende Sprecher:innen",

        },
        nodeLabel: {
default,Start Call Recording            de_DE: "Gesprächsaufzeichnung starten",

        },
        nodeSummary: {
default,Start or resume recording of a call            de_DE: "Aufzeichnung eines Anrufs starten oder fortsetzen",

        },

    },
    recordingStop: {
inputTerminateDescription,[object Object]        inputTerminateLabel: {
default,Stop Call Recording            de_DE: "Gesprächsaufzeichnung stoppen",

        },
        nodeLabel: {
default,Stop Call Recording            de_DE: "Gesprächsaufzeichnung stoppen",

        },
        nodeSummary: {
default,Pause or stop recording of a call            de_DE: "Gesprächsaufzeichnung anhalten oder beenden",

        },

    },
    sendData: {
inputDataDescription,[object Object]        nodeLabel: {
default,Send Data            de_DE: "Daten senden",

        },
        nodeSummary: {
default,Attach custom data to a dialog            de_DE: "Benutzerdefinierte Daten an einen Dialog anhängen",

        },

    },
    shared: {
inputAcceptAnsweringMachinesDescription,[object Object]        inputAcceptAnsweringMachinesLabel: {
default,Accept Answering Machines            de_DE: "Anrufbeantworter akzeptieren",

        },
        inputBargeInDescription: {
default,To let the speaker interrupt the audio file, activate this checkbox.            de_DE: "Um den:die Sprechend:e die Audiodatei unterbrechen zu lassen, aktivieren Sie diese Checkbox.",

        },
        inputBargeInLabel: {
default,Barge In            de_DE: "Unterbrechen",

        },
        inputCallerIdDescription: {
default,Enter the phone number that should be displayed to the callee. (This is a best-effort option. A correct display can not be guaranteed.)            de_DE: "Geben Sie die Rufnummer ein, die dem:der Angerufenen angezeigt werden soll. (Dies ist eine Best-Effort-Option. Eine korrekte Anzeige kann nicht garantiert werden.)",

        },
        inputCallerIdLabel: {
default,Displayed Caller ID            de_DE: "Angezeigte Anrufer-ID",

        },
        inputCustomSipHeadersDescription: {
default,Enter an object where each property is the name of a header, and the value is a list of strings. All header names must begin with X-.            de_DE: "Geben Sie ein Objekt ein, bei dem jede Eigenschaft der Name eines Headers ist und der Wert eine Liste von Strings ist. Alle Header-Namen müssen mit X- beginnen.",

        },
        inputCustomSipHeadersLabel: {
default,Custom SIP Headers            de_DE: "Benutzerdefinierte SIP-Header",

        },
        inputDataDescription: {
default,Enter an object with key-value pairs that should be attached as custom data to the dialog.            de_DE: "Geben Sie ein Objekt mit Schlüssel-Wert-Paaren ein, das als benutzerdefinierte Daten an den Dialog angehängt werden sollen.",

        },
        inputDataLabel: {
default,Custom Data            de_DE: "Benutzerdefinierte Daten",

        },
        inputEndFlowDescription: {
default,To stop the flow after executing this node, activate this checkbox.            de_DE: "Um den Flow nach der Ausführung dieses Knotens zu stoppen, aktivieren Sie diese Checkbox.",

        },
        inputEndFlowLabel: {
default,Quit Flow            de_DE: "Flow beenden",

        },
        inputExperimentalEnableRingingToneDescription: {
default,To play a ringing tone during a pending call, activate this checkbox. This setting will change in the future.            de_DE: "Um während eines Anrufes, der sich im Rufaufbau befindet, ein Kingelton abzuspielen, aktivieren Sie diese Checkbox. Diese Einstellung wird sich in Zukunft ändern.",

        },
        inputExperimentalEnableRingingToneLabel: {
default,(EXPERIMENTAL) Enable Ringing Tone            de_DE: "(EXPERIMENTAL) Klingelton aktivieren",

        },
        inputInterpretAsDescription: {
default,Specify whether the text should be interpreted as text or SSML markup.            de_DE: "Legen Sie fest, ob der Text als Text oder SSML-Auszeichnung interpretiert werden soll.",

        },
        inputInterpretAsLabel: {
default,Interpret as            de_DE: "Interpretieren als",

        },
        inputLanguageDescription: {
default,To overwrite the Text-to-Speech language for specific messages, enter the language you want.            de_DE: "Um die Text-to-Speech-Sprache für bestimmte Nachrichten zu überschreiben, geben Sie die gewünschte Sprache ein.",

        },
        inputLanguageLabel: {
default,Language            de_DE: "Sprache",

        },
        inputMaxDigitsLabel: {
default,Maximum Allowed Digits
        },
        inputRecordingIdDescription: {
default,An arbitrary string to idetnify the the recording in case multiple recordings are created in the same dialog
        },
        inputRecordingIdLabel: {
default,Recording ID
        },
        inputRingTimeoutDescription: {
default,Enter the maximum time in seconds that the call should ring before the call attempt is canceled.            de_DE: "Geben Sie die maximale Zeit in Sekunden ein, die der Anruf läuten soll, bevor der Anrufversuch abgebrochen wird.",

        },
        inputRingTimeoutLabel: {
default,Ring Timeout (s)            de_DE: "Zeitüberschreitung beim Klingeln (s)",

        },
        inputSubmitInputsDescription: {
default,One or more synonyms to end an number input, such as DTMF_#
        },
        inputSubmitInputsLabel: {
default,Submit Inputs
        },
        inputSynthesizersDescription: {
default,If specified, this parameter overwrites the Text-to-Speech list from the project settings.            de_DE: "Sofern angegeben, überschreibt dieser Parameter die Text-to-Speech-Liste aus den Projekteinstellungen.",

        },
        inputSynthesizersLabel: {
default,Text-to-Speech Profiles            de_DE: "Text-to-Speech-Profile",

        },
        inputTextDescription: {
default,Enter the message to introduce the prompt to the caller.            de_DE: "Geben Sie die Nachricht ein, mit der dem:der Anrufer:in die Eingabeaufforderung vorgestellt werden soll.",

        },
        inputTextLabel: {
default,Message            de_DE: "Nachricht",

        },
        inputTimeoutDescription: {
default,Enter the duration in seconds after which the prompt should be cancelled.            de_DE: "Geben Sie die Dauer in Sekunden an, nach der die Eingabeaufforderung abgebrochen werden soll.",

        },
        inputTimeoutLabel: {
default,Timeout            de_DE: "Zeitüberschreitung",

        },
        inputUseMaxDigitsDescription: {
default,Use the Maximum Digits property as a stop condition
        },
        inputUseMaxDigitsLabel: {
default,Use Max Digits
        },
        inputUseSubmitInputsDescription: {
default,Use the Submit Inputs property as a stop condition
        },
        inputUseSubmitInputsLabel: {
default,Use Submit Inputs
        },
        inputWhisperingTextDescription: {
default,Enter the text that should be announced to the agent the call is transfered to before the call parties are connected.            de_DE: "Geben Sie den Text ein, der dem:der Agent:in bei der Weiterleitung angesagt werden soll, bevor die Gesprächsteilnehmer:innen verbunden werden.",

        },
        inputWhisperingTextLabel: {
default,Whispering Announcement            de_DE: "Whispering-Ansage",

        },
        sectionStopConditionLabel: {
default,Stop Condition
        },

    },
    speak: {
inactivityTimeoutDescription,[object Object]        inactivityTimeoutLabel: {
default,Inactivity Timeout (s)
        },
        inputAdditionalTextLabel: {
default,Additional Text
        },
        inputTextLabel: {
default,Text            de_DE: "Text",

        },
        nodeLabel: {
default,Speak (with SSML formatting)            de_DE: "Sprechen (mit SSML-Formatierung)",

        },
        nodeSummary: {
default,Speak something out to the caller with SSML support            de_DE: "Dem:Der Anrufer:in mit SSML-Unterstützung etwas vorsprechen",

        },
        sectionTextOptionsLabel: {
default,Additional Text Section
        },

    },
    speechToText: {
inputLanguageLabel,[object Object]        inputProfileTokenDescription: {
default,Please use the profile token as displayed in VIER CVG, Speech Service Profiles
        },
        inputProfileTokenFallbackDescription: {
default,Profile Token Fallback
        },
        inputProfileTokenFallbackLabel: {
default,Profile Token Fallback
        },
        inputProfileTokenLabel: {
default,Profile Token
        },
        inputServiceFallbackLabel: {
default,Speech-to-Text Fallback
        },
        inputServiceLabel: {
default,Speech-to-Text Service
        },
        inputTranscriberDescription: {
default,Type in one of the follow Speech-to-Text Services: 'GOOGLE', 'IBM', 'MICROSOFT' or leave empty to set a service via profile token
        },
        nodeLabel: {
default,Set Speech-to-Text Service
        },
        nodeSummary: {
default,Speech-to-Text services need to be used to transcribe the expected input in the the best possible way
        },
        sectionFallback: {
default,Fallback Option
        },
        sectionSelectLanguageLabel: {
default,Select Language
        },
        sectionSelectSTTLabel: {
default,Select Speech-to-Text Services
        },

    },
    terminate: {
nodeLabel,[object Object]        nodeSummary: {
default,Cancel the call            de_DE: "Anruf abbrechen",

        },

    },

};