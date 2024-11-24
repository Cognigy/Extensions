/* tslint:disable:quotemark */
// This code is generated!
export default {
    aggregateInput: {
        enableFieldDescription: {
            'default': "To activate the aggregation of utterances, activate this setting.",
            'deDE': "Um die Aggregation von Aussagen einzuschalten, aktivieren Sie diese Einstellung.",
        },
        enableFieldLabel: {
            'default': "Enable or disable the utterance aggregation",
            'deDE': "Aggregation von Aussagen aktivieren oder deaktivieren",
        },
        nodeLabel: {
            'default': "Aggregate Utterances",
            'deDE': "Aussagen aggregieren",
        },
        nodeSummary: {
            'default': "Activate Aggregation of Utterances",
            'deDE': "Aggregation von Aussagen aktivieren",
        },
        timeoutFieldDescription: {
            'default': "Select the time after the last utterance after which the utterance is considered complete and should be delivered to the bot.",
            'deDE': "Wählen Sie die Zeit, die nach der letzten Aussage abgelaufen sein muss, damit sie als vollständig gilt und an den Bot geliefert wird.",
        },
        timeoutFieldLabel: {
            'default': "Utterance Aggregation Timeout in (s)",
            'deDE': "Zeit (in s), nach der die Aggregation der Aussagen endet",
        },
    },
    bargeIn: {
        input: {
            confidenceDescription: {
                'default': "Enter the threshold value that individual transcribed utterances of the call partner must reach for the bot to be interrupted. 70% and higher are recommended values.",
                'deDE': "Geben Sie den Schwellenwert ein, den einzelne transkribierte Aussagen des:der Gesprächspartners:in ereichen müssen, damit der Bot unterbrochen wird. Empfehlenswert sind Werte ab 70%.",
            },
            confidenceLabel: {
                'default': "Confidence Threshold [in percent %]",
                'deDE': "Konfidenzintervall [in Prozent %]",
            },
            onDtmfDescription: {
                'default': "To allow the call partner to interrupt the bot by pressing keys, select this checkbox.",
                'deDE': "Damit der:dieGesprächspartner:in den Bot durch Drücken von Tasten unterbrechen kann, aktivieren Sie diese Einstellung.",
            },
            onDtmfLabel: {
                'default': "By pressing keys",
                'deDE': "Durch Drücken von Tasten",
            },
            onSpeechDescription: {
                'default': "To allow the call partner to interrupt the bot by speaking, select this checkbox.",
                'deDE': "Damit der:die Gesprächspartner:in den Bot durch Sprechen unterbrechen kann, aktivieren Sie diese Einstellung.",
            },
            onSpeechLabel: {
                'default': "By speaking",
                'deDE': "Durch Sprechen",
            },
            phraseListDescription: {
                'default': "Enter the words and phrases that trigger a barge-in.",
                'deDE': "Geben Sie die Begriffe und Sätze ein, die ein Barge-in auslösen sollen.",
            },
            phraseListFromContextDescription: {
                'default': "Enter the key for which a phrase list is stored at Context. If this node contains a phrase list, then it will be merged with the referenced phrase list.",
                'deDE': "Geben Sie den Schlüssel ein, für den bei Context eine Begriffsliste hinterlegt ist. Wenn dieser Knoten eine Begriffsliste enthält, wird diese mit der referenzierten Begriffsliste zusammengeführt.",
            },
            phraseListFromContextLabel: {
                'default': "Phrase List from Context",
                'deDE': "Begriffsliste aus Context",
            },
            phraseListLabel: {
                'default': "Phrase List",
                'deDE': "Begriffsliste",
            },
        },
        section: {
            label: {
                'default': "Barge-in",
                'deDE': "Barge-in",
            },
        },
        useDefaultToggleLabel: {
            'default': "Overwrite preset",
            'deDE': "Voreinstellungen überschreiben",
        },
    },
    bridge: {
        inputExtensionLengthDescription: {
            'default': "Select the size of the extension range from which VIER Cognitive Voice Gateway should select a phone number from.",
            'deDE': "Wählen Sie die Größe des Durchwahlen-Bereiches, aus dem VIER Cognitive Voice Gateway eine Rufnummer wählen soll.",
        },
        inputExtensionLengthLabel: {
            'default': "Extension Length",
            'deDE': "Durchwahl-Länge",
        },
        inputHeadNumberDescription: {
            'default': "Enter the prefix of the phone number the call should be forwarded to.",
            'deDE': "Geben Sie die Vorwahl der Rufnummer ein, an die der Anruf weitergeleitet werden soll.",
        },
        inputHeadNumberLabel: {
            'default': "Phone Number Prefix",
            'deDE': "Rufnummernvorwahl",
        },
        nodeLabel: {
            'default': "Forward Call to a Contact Center",
            'deDE': "Anruf an ein Contact Center weiterleiten",
        },
        nodeSummary: {
            'default': "Forward the call to a contact center for agent assistance",
            'deDE': "Anruf an ein Contact Center zur Unterstützung durch eine:n Agent:in weiterleiten",
        },
    },
    changeDefaults: {
        nodeLabel: {
            'default': "Configure presets for nodes",
            'deDE': "Voreinstellungen für Nodes konfigurieren",
        },
        nodeSummary: {
            'default': "Change presets of nodes",
            'deDE': "Voreinstellungen von Nodes ändern",
        },
        overwriteStrategy: {
            doNotChangeOption: {
                'default': "Keep",
                'deDE': "Beibehalten",
            },
            resetOption: {
                'default': "Reset to project value",
                'deDE': "Auf Projekteinstellungen zurücksetzen",
            },
            useValue: {
                bargeInOption: {
                    'default': "Configure new default barge-in settings",
                    'deDE': "Neue Barge-in-Einstellungen konfiguieren",
                },
                synthesizersOption: {
                    'default': "Configure new default text-to-speech services",
                    'deDE': "Neue Standard-Text-to-Speech-Dienste konfigurieren",
                },
                ttsLanguageOption: {
                    'default': "Configure new default text-to-speech language",
                    'deDE': "Neue Standard-Text-to-Speech-Sprache konfigurieren",
                },
            },
        },
        synthesizersOverwriteStrategyDescription: {
            'default': "Here you can change the presets from your CVG project for the text-to-speech services. This setting overwrites your project settings.",
            'deDE': "Hier können Sie die Voreinstellungen aus Ihrem CVG-Projekt für die Text-to-Speech-Dienste ändern. Diese Einstellung überschreibt Ihre Projekteinstellungen.",
        },
        synthesizersOverwriteStrategyLabel: {
            'default': "Default text-to-speech services",
            'deDE': "Standard-Text-to-Speech-Dienste",
        },
        ttsBargeInOverwriteStrategyDescription: {
            'default': "Select the default settings for barge-in.",
            'deDE': "Wählen Sie die Standardeinstellungen für Barge-in.",
        },
        ttsBargeInOverwriteStrategyLabel: {
            'default': "Default barge-in settings",
            'deDE': "Standardeinstellungen für Barge-in",
        },
        ttsLanguageDescription: {
            'default': "Select the new text-to-speech language.",
            'deDE': "Ändern Sie die voreingestellte Text-to-Speech-Sprache.",
        },
        ttsLanguageLabel: {
            'default': "New text-to-speech language",
            'deDE': "Neue Text-to-Speech-Sprache",
        },
        ttsLanguageOverwriteStrategyDescription: {
            'default': "Here you can change the presets from your CVG project for the text-to-speech language. This setting overwrites your project settings.",
            'deDE': "Hier können Sie die Voreinstellungen aus Ihrem CVG-Projekt für die Text-to-Speech-Sprache ändern. Diese Einstellung überschreibt Ihre Projekteinstellungen.",
        },
        ttsLanguageOverwriteStrategyLabel: {
            'default': "Default text-to-speech language",
            'deDE': "Standard-Text-to-Speech-Sprache",
        },
        ttsSectionLabel: {
            'default': "Text-to-speech",
            'deDE': "Text-to-Speech",
        },
    },
    forward: {
        nodeLabel: {
            'default': "Forward Call",
            'deDE': "Anruf weiterleiten",
        },
        nodeSummary: {
            'default': "Forward the call to a different destination",
            'deDE': "Anruf an ein anderes Ziel weiterleiten",
        },
        sectionAdditionalDataLabel: {
            'default': "Data",
            'deDE': "Daten",
        },
        sectionAdditionalSettingsLabel: {
            'default': "Additional Settings",
            'deDE': "Zusätzliche Einstellungen",
        },
        sectionCallLabel: {
            'default': "Call Settings",
            'deDE': "Anruf-Einstellungen",
        },
    },
    multipleChoicePrompt: {
        inputChoicesDescription: {
            'default': "Add and adopt words and their synonyms to your need.",
            'deDE': "Fügen Sie Wörter und ihre Synonyme nach Bedarf hinzu und übernehmen Sie diese.",
        },
        inputChoicesLabel: {
            'default': "Choices",
            'deDE': "Auswahlmöglichkeiten",
        },
        nodeLabel: {
            'default': "Ask a Multiple Choice Question",
            'deDE': "Multiple-Choice-Frage stellen",
        },
        nodeSummary: {
            'default': "Say something to the call with a multiple choice prompt",
            'deDE': "Dem:Der Anrufer:in etwas mit einer Multiple-Choice-Aufforderung sagen",
        },
        sectionChoicesSectionLabel: {
            'default': "Choices",
            'deDE': "Auswahlmöglichkeiten",
        },
    },
    outboundService: {
        nodeLabel: {
            'default': "Check Call Forwarding Result",
            'deDE': "Ergebnis der Anrufweiterleitung prüfen",
        },
        nodeSummary: {
            'default': "Check the Result of the Previous Call Forwarding",
            'deDE': "Ergebnis der vorherigen Anrufweiterleitung prüfen",
        },
    },
    play: {
        inputFallbackTextDescription: {
            'default': "Enter the text to be announced when the audio file cannot be played.",
            'deDE': "Geben Sie den Text ein, der verwendet werden soll, wenn die Audiodatei nicht abgespielt werden kann.",
        },
        inputFallbackTextLabel: {
            'default': "Fallback Text",
            'deDE': "Fallback-Text",
        },
        inputUrlLabel: {
            'default': "Audio file URL",
            'deDE': "Audiodatei-URL",
        },
        inputUrlLabelDescription: {
            'default': "Enter the location of the audio file. \nAllowed formats: Linear PCM with signed 16 bits (8 kHz or 16 kHz), A-law or µ-law 8 kHz.",
            'deDE': "Geben Sie den Speicherort für die Audiodatei ein. Erlaubte Formate: Linear-PCM mit vorzeichenbehafteten 16 Bit (8 kHz oder 16 kHz), A-law oder µ-law 8 kHz.",
        },
        modeBackgroundOption: {
            'default': "Background",
            'deDE': "Hintergrund",
        },
        modeDescription: {
            'default': "Select where the audio file should be played. \n\nTo stop the music, you must configure exactly the same settings under Settings in the Stop Audio Playback node as in this node.",
            'deDE': "Wählen Sie, wo die Audiodatei abgespielt werden soll.\n\nZum Stoppen der Musik, müssen Sie unter Audiowiedergabe stoppen > Allgemeine Einstellungen  genau dieselben Einstellungen konfigurieren wie hier.",
        },
        modeForegroundOption: {
            'default': "Foreground",
            'deDE': "Vordergrund",
        },
        modeLabel: {
            'default': "Play audio file in",
            'deDE': "Audiodatei abspielen im",
        },
        nodeLabel: {
            'default': "Play Audio File",
            'deDE': "Audiodatei abspielen",
        },
        nodeSummary: {
            'default': "Play an audio file to the call",
            'deDE': "Audiodatei für den Anruf abspielen",
        },
    },
    promptForNumber: {
        inputMaxDigitsDescription: {
            'default': "Enter the maximum number of digits that the number can have. If this option is enabled, then the input ends as soon as the amount of digits is reached.",
            'deDE': "Geben Sie die Ziffernanzahl ein, die die Nummer maximal haben darf. Wenn diese Option aktiviert ist, endet die Eingabe, sobald die maximale Anzahl erreicht ist.",
        },
        inputMaxDigitsLabel: {
            'default': "Maximum Allowed Digits",
            'deDE': "Maximal erlaubte Ziffernanzahl",
        },
        inputMinDigitsDescription: {
            'default': "Enter the minimum number of digits required for the prompt to succeed.",
            'deDE': "Geben Sie die Anzahl der Ziffern ein, die für den Erfolg der Eingabeaufforderung mindestens erforderlich sind.",
        },
        inputMinDigitsLabel: {
            'default': "Minimum Required Digits",
            'deDE': "Erforderliche Mindestanzahl von Ziffern",
        },
        inputSubmitInputsDescription: {
            'default': "Select one or more characters with which the caller should confirm the number entry. Allowed are 0-9, * and #. You can enter only one character per line.",
            'deDE': "Wählen Sie ein oder mehrere Zeichen, mit dem der:die Anrufer:in die Nummerneingabe bestätigen soll. Erlaubt sind 0-9, * und #. Pro Zeile können Sie nur ein Zeichen eingeben.",
        },
        inputSubmitInputsLabel: {
            'default': "Submit Inputs",
            'deDE': "Eingaben übermitteln",
        },
        nodeLabel: {
            'default': "Ask for a Number",
            'deDE': "Nach einer Nummer fragen",
        },
        nodeSummary: {
            'default': "Say something to the caller with a prompt to enter a number",
            'deDE': "Dem:Der Anrufer:in etwas mitteilen und ihn:sie auffordern, eine Nummer einzugeben",
        },
    },
    recordingStart: {
        inputMaxDurationDescription: {
            'default': "Select the maximum call recording duration in seconds, after which the call recording will be stopped automatically.",
            'deDE': "Wählen Sie die maximale Dauer der Gesprächsaufzeichnung in Sekunden, nach der die Gesprächsaufzeichnung automatisch beendet werden soll.",
        },
        inputMaxDurationLabel: {
            'default': "Maximum Call Recording Duration (in s)",
            'deDE': "Maximaldauer der Gesprächsaufzeichnung (in s)",
        },
        inputSpeakersAgentLabel: {
            'default': "Agent",
            'deDE': "Agent:in",
        },
        inputSpeakersBothLabel: {
            'default': "Both Call Partners",
            'deDE': "Beide Gesprächspartner:innen",
        },
        inputSpeakersCustomerLabel: {
            'default': "Customer",
            'deDE': "Kund:in",
        },
        inputSpeakersLabel: {
            'default': "Speaker to record",
            'deDE': "Aufzuzeichnende:r Sprecher:in",
        },
        nodeLabel: {
            'default': "Start Call Recording",
            'deDE': "Gesprächsaufzeichnung starten",
        },
        nodeSummary: {
            'default': "Start or resume recording of a call",
            'deDE': "Aufzeichnung eines Anrufs starten oder fortsetzen",
        },
    },
    recordingStop: {
        inputTerminateDescription: {
            'default': "To stop the call recording rather than to pause, activate this setting.",
            'deDE': "Um die Gesprächsaufzeichnung zu beenden und nicht zu unterbrechen, aktivieren Sie diese Einstellung.",
        },
        inputTerminateLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
        },
        nodeLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
        },
        nodeSummary: {
            'default': "Pause or stop recording of a call",
            'deDE': "Gesprächsaufzeichnung anhalten oder beenden",
        },
    },
    refer: {
        nodeLabel: {
            'default': "Use SIP REFER",
            'deDE': "Via SIP-REFER weiterleiten",
        },
        nodeSummary: {
            'default': "Forward the call to a different destination using SIP REFER",
            'deDE': "Anruf mittels SIP-REFER an ein anderes Ziel weiterleiten",
        },
    },
    referService: {
        nodeLabel: {
            'default': "Check SIP REFER result",
            'deDE': "SIP-REFER-Ergebnis prüfen",
        },
        nodeSummary: {
            'default': "Check the result of the previous forwarding via SIP REFER",
            'deDE': "Ergebnis der vorangehenden Weiterleitung via SIP-REFER prüfen",
        },
    },
    sendData: {
        inputDataDescription: {
            'default': "Enter an object with arbitrary properties. Each property must have a string value.",
            'deDE': "Geben Sie ein Objekt mit beliebigen Eigenschaften ein. Jede Eigenschaft muss einen String-Wert haben.",
        },
        nodeLabel: {
            'default': "Send Data",
            'deDE': "Daten senden",
        },
        nodeSummary: {
            'default': "Attach custom data to a dialog",
            'deDE': "Benutzerdefinierte Daten an einen Dialog anhängen",
        },
    },
    shared: {
        changeSynthesizersSwitchLabel: {
            'default': "Configure new text-to-speech services",
            'deDE': "Neuen Text-to-Speech-Dienst konfigurieren",
        },
        childDefaultLabel: {
            'default': "Default",
            'deDE': "Default",
        },
        childFailureLabel: {
            'default': "On Failure",
            'deDE': "On Failure",
        },
        childSuccessLabel: {
            'default': "On Success",
            'deDE': "On Success",
        },
        childTerminationLabel: {
            'default': "On Termination",
            'deDE': "On Termination",
        },
        inputAcceptAnsweringMachinesDescription: {
            'default': "If enabled, the bot will accept answering machines picking up the calls.",
            'deDE': "Wenn diese Option aktiviert ist, dann akzeptiert der Bot Anrufbeantworter, die die Anrufe entgegennehmen.",
        },
        inputAcceptAnsweringMachinesLabel: {
            'default': "Accept Answering Machines",
            'deDE': "Anrufbeantworter akzeptieren",
        },
        inputCallerIdDescription: {
            'default': "Enter the phone number that should be displayed to the callee. (This is a best-effort option. A correct display can not be guaranteed.)",
            'deDE': "Geben Sie die Rufnummer ein, die dem:der Angerufenen angezeigt werden soll. (Dies ist eine Best-Effort-Option. Eine korrekte Anzeige kann nicht garantiert werden.)",
        },
        inputCallerIdLabel: {
            'default': "Displayed Caller ID",
            'deDE': "Angezeigte Anrufer-ID",
        },
        inputCustomSipHeadersDescription: {
            'default': "Enter an object where each property is the name of a header, and the value is a list of strings. All header names must begin with X-.",
            'deDE': "Geben Sie ein Objekt ein, bei dem jede Eigenschaft der Name eines Headers ist und der Wert eine Liste von Strings ist. Alle Header-Namen müssen mit X- beginnen.",
        },
        inputCustomSipHeadersLabel: {
            'default': "Custom SIP Headers",
            'deDE': "Custom-SIP-Header",
        },
        inputDataDescription: {
            'default': "Enter an object with key-value pairs that should be attached as custom data to the dialog.",
            'deDE': "Geben Sie ein Objekt mit Schlüssel-Wert-Paaren ein, das als benutzerdefinierte Daten an den Dialog angehängt werden sollen.",
        },
        inputDataLabel: {
            'default': "Custom Data",
            'deDE': "Benutzerdefinierte Daten",
        },
        inputDestinationDescription: {
            'default': "Enter the destination as a phone number with country code (e.g. +491467...) or as a SIP URI (e.g. sip:user@example.org).",
            'deDE': "Geben Sie das Ziel als Rufnummer mit Ländervorwahl (z. B. +491467...) oder als SIP-URI (z. B. sip:user@example.org) ein.",
        },
        inputDestinationLabel: {
            'default': "Destination",
            'deDE': "Ziel",
        },
        inputEndFlowDescription: {
            'default': "To stop the flow after executing this node, activate this setting.",
            'deDE': "Um den Flow nach der Ausführung dieses Knotens zu stoppen, aktivieren Sie diese Einstellung.",
        },
        inputEndFlowLabel: {
            'default': "Quit Flow",
            'deDE': "Flow beenden",
        },
        inputExperimentalEnableRingingToneDescription: {
            'default': "To play a ringing tone during a pending call, activate this setting. This setting may change in the future.",
            'deDE': "Um während eines Anrufes, der sich im Rufaufbau befindet, einen Klingelton abzuspielen, aktivieren Sie diese Einstellung. Hinweis! Diese Einstellung kann sich in Zukunft ändern.",
        },
        inputExperimentalEnableRingingToneLabel: {
            'default': "Enable Ringing Tone",
            'deDE': "Klingelton aktivieren",
        },
        inputLanguageDefaultLabel: {
            'default': "Use preset language",
            'deDE': "Voreingestellte Sprache verwenden",
        },
        inputLanguageDescription: {
            'default': "To overwrite the Text-to-Speech language for specific messages, enter the language you want.",
            'deDE': "Um die Text-to-Speech-Sprache für bestimmte Nachrichten zu überschreiben, geben Sie die gewünschte Sprache ein.",
        },
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
        },
        inputRecordingIdDescription: {
            'default': "Enter an arbitrary string to identify the call recording if multiple call recordings are created in the same dialog.",
            'deDE': "Geben Sie einen beliebigen String zur Identifizierung der Gesprächsaufzeichnung ein, wenn mehrere Gesprächsaufzeichnungen im selben Dialog erstellt werden.",
        },
        inputRecordingIdLabel: {
            'default': "Call Recording ID",
            'deDE': "Gesprächsaufzeichnungs-ID",
        },
        inputRingTimeoutDescription: {
            'default': "Enter the maximum time in seconds that the call should ring before the call attempt is canceled.",
            'deDE': "Geben Sie die maximale Zeit in Sekunden ein, die der Anruf läuten soll, bevor der Anrufversuch abgebrochen wird.",
        },
        inputRingTimeoutLabel: {
            'default': "Ring Timeout (in s)",
            'deDE': "Zeitüberschreitung beim Klingeln (in s)",
        },
        inputSynthesizersDescription: {
            'default': "DEPRECATED Please use the settings above.",
            'deDE': "VERALTET Um die Text-to-Speech Sprache einzustellen, nutzen Sie die oben gezeigten Einstellungen.",
        },
        inputSynthesizersLabel: {
            'default': "Text-to-Speech Profiles DEPRECATED",
            'deDE': "Text-to-Speech-Profile VERALTET",
        },
        inputTextDescription: {
            'default': "Enter the message to introduce the prompt to the caller.",
            'deDE': "Geben Sie die Nachricht ein, mit der dem:der Anrufer:in die Eingabeaufforderung vorgestellt werden soll.",
        },
        inputTextLabel: {
            'default': "Message",
            'deDE': "Nachricht",
        },
        inputTimeoutDescription: {
            'default': "Enter the duration in seconds after which the prompt should be cancelled.",
            'deDE': "Geben Sie die Dauer in Sekunden an, nach der die Eingabeaufforderung abgebrochen werden soll.",
        },
        inputTimeoutLabel: {
            'default': "Timeout",
            'deDE': "Zeitüberschreitung",
        },
        inputUserToUserDescription: {
            'default': "A list of opaque strings that are send as User-To-User SIP headers.",
        },
        inputUserToUserLabel: {
            'default': "User-To-User Information (UUI)",
            'deDE': "User-to-User-Information (UUI)",
        },
        inputWhisperingTextDescription: {
            'default': "Enter the text that should be announced to the agent the call is forwarded to before the call partners are connected.",
            'deDE': "Geben Sie den Text ein, der dem:der Agent:in bei der Weiterleitung angesagt werden soll, bevor die Gesprächspartner:innen verbunden werden.",
        },
        inputWhisperingTextLabel: {
            'default': "Whispering Announcement",
            'deDE': "Whispering-Ansage",
        },
        sectionGeneralLabel: {
            'default': "General Settings",
            'deDE': "Allgemeine Einstellungen",
        },
        sectionSipLabel: {
            'default': "Use SIP Header",
            'deDE': "SIP-Header verwenden",
        },
        sectionStopConditionLabel: {
            'default': "Stop Condition",
            'deDE': "Stoppbedingung",
        },
        sectionTtsLabel: {
            'default': "Text-to-speech service settings",
            'deDE': "Text-to-Speech-Dienst-Einstellungen",
        },
    },
    speak: {
        inputAdditionalTextLabel: {
            'default': "Additional Text",
            'deDE': "Zusätzlicher Text",
        },
        inputTextLabel: {
            'default': "Text",
            'deDE': "Text",
        },
        languageLabel: {
            'default': "Language",
            'deDE': "Sprache",
        },
        nodeLabel: {
            'default': "Speak (with SSML formatting)",
            'deDE': "Sprechen (mit SSML-Formatierung)",
        },
        nodeSummary: {
            'default': "Speak something out to the caller with SSML support",
            'deDE': "Dem:Der Anrufer:in mit SSML-Unterstützung etwas vorsprechen",
        },
        sectionTextOptionsLabel: {
            'default': "Additional Text Section",
            'deDE': "Zusätzlicher Textabschnitt",
        },
    },
    speechToText: {
        inputBoostedPhrasesDescription: {
            'default': "Enter the list of phrases that receive an increased weight during voice recognition.",
            'deDE': "Geben Sie die Liste der Begriffe ein, die bei der Spracherkennung eine höhere Gewichtung erhalten sollen.",
        },
        inputBoostedPhrasesFromContextDescription: {
            'default': "Enter the key for which a list of phrases to be preferred is stored in the Context. If this node contains a list of preferred phrases, then it will be merged with the list from the Context.",
            'deDE': "Geben Sie den Schlüssel ein, für den im Context eine Liste mit bevorzugten Begriffen hinterlegt ist. Wenn dieser Knoten eine Liste enthält, wird diese mit der referenzierten Liste zusammengeführt.",
        },
        inputBoostedPhrasesFromContextLabel: {
            'default': "Boosted Phrases from Context",
            'deDE': "Stärker gewichtete Begriffe aus Context",
        },
        inputBoostedPhrasesLabel: {
            'default': "Boosted Phrases",
            'deDE': "Stärker gewichtete Begriffe",
        },
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
        },
        inputProfanityFilterDescription: {
            'default': "To activate the profanity filter, activate this setting.",
            'deDE': "Um Schimpfwörter herauszufiltern, aktivieren Sie diese Einstellung.",
        },
        inputProfanityFilterLabel: {
            'default': "Enable the Profanity Filter",
            'deDE': "Filtern von Schimpfwörtern aktivieren",
        },
        inputProfileTokenDescription: {
            'default': "Use the profile token as displayed in VIER Cognitive Voice Gateway under Speech service profiles > Profile token.",
            'deDE': "Verwenden Sie das Profiltoken, wie es in VIER Cognitive Voice Gateway unter Sprachdienst-Profile > Profiltoken angezeigt wird.",
        },
        inputProfileTokenFallbackDescription: {
            'default': "Use the profile token as fallback, as displayed in VIER Cognitive Voice Gateway under Speech service profiles > Profile token.",
            'deDE': "Verwenden Sie das Profiltoken als Fallback, wie es in VIER Cognitive Voice Gateway unter Sprachdienst-Profile > Profiltoken angezeigt wird.",
        },
        inputProfileTokenFallbackLabel: {
            'default': "Profile Token Fallback",
            'deDE': "Profiltoken-Fallback",
        },
        inputProfileTokenLabel: {
            'default': "Profile Token",
            'deDE': "Profiltoken",
        },
        inputServiceFallbackLabel: {
            'default': "Speech-to-Text Service Fallback",
            'deDE': "Fallback für Speech-to-Text-Dienst",
        },
        inputServiceLabel: {
            'default': "Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst",
        },
        inputTranscriberDescription: {
            'default': "Select a speech-to-text service.",
            'deDE': "Wählen Sie einen Speech-to-Text-Dienst.",
        },
        nodeLabel: {
            'default': "Configure speech-to-text service",
            'deDE': "Speech-to-Text-Dienst konfigurieren",
        },
        nodeSummary: {
            'default': "Change speech-to-text services to transcribe the expected input in the best possible way",
            'deDE': "Speech-to-Text-Dienste wechseln, um die erwartete Eingabe bestmöglich zu transkribieren",
        },
        sectionDynamicProfileSettings: {
            'default': "Dynamic Profile",
            'deDE': "Dynamisches Profil",
        },
        sectionFallback: {
            'default': "Fallback Option",
            'deDE': "Fallback-Option",
        },
        sectionSelectLanguageLabel: {
            'default': "Select Language",
            'deDE': "Sprache wählen",
        },
        sectionSelectSTTLabel: {
            'default': "Select Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst wählen",
        },
    },
    stopPlay: {
        inputUrlLabelDescription: {
            'default': "Enter exactly the same audio file URL as the one entered in the \"Play Audio File\" node.",
            'deDE': "Geben Sie exakt die gleiche Audiodatei-URL an wie die URL, die im Knoten „Audiodatei abspielen“ eingetragen ist.",
        },
        nodeLabel: {
            'default': "Stop Audio Playback",
            'deDE': "Audiowiedergabe stoppen",
        },
        nodeSummary: {
            'default': "Stop the audio playback started using the \"Play Audio File\" node",
            'deDE': "Audiowiedergabe stoppen , die über den Knoten „Audiodatei abspielen“ gestartet wurde",
        },
    },
    terminate: {
        nodeLabel: {
            'default': "End Call",
            'deDE': "Anruf beenden",
        },
        nodeSummary: {
            'default': "Cancel the call",
            'deDE': "Anruf abbrechen",
        },
    },
    textToSpeech: {
        inputProfileTokenDescription: {
            'default': "Enter the profile token as displayed in CVG under Speech service profiles > Profile basic data > Profile token.",
            'deDE': "Geben Sie das Profiltoken so ein, wie es in CVG unter Sprachdienst-Profile > Profil-Basisdaten > Profiltoken angezeigt wird.",
        },
        inputProfileTokenFallbackDescription: {
            'default': "Enter the profile token fallback as displayed in CVG under Speech service profiles > Profile basic data > Profile token.",
            'deDE': "Geben Sie das Profiltoken-Fallback so ein, wie es in CVG unter Sprachdienst-Profile > Profil-Basis-Daten > Profiltoken angezeigt wird.",
        },
        inputProfileTokenFallbackLabel: {
            'default': "Profile token fallback",
            'deDE': "Profiltoken-Fallback",
        },
        inputProfileTokenLabel: {
            'default': "Profile token",
            'deDE': "Profiltoken",
        },
        inputServiceDescription: {
            'default': "Select the text-to-speech service to be used as the default.",
            'deDE': "Wählen Sie den Text-to-Speech-Dienst, der als Standard verwendet werden soll.",
        },
        inputServiceFallbackDescription: {
            'default': "Select the text-to-speech service to be used as the fallback.",
            'deDE': "Wählen Sie den Text-to-Speech-Dienst, der als Fallback verwendet werden soll.",
        },
        inputServiceFallbackLabel: {
            'default': "New fallback text-to-speech service",
            'deDE': "Neuer Text-to-Speech-Dienst für Fallback",
        },
        inputServiceLabel: {
            'default': "New text-to-speech service",
            'deDE': "Neuer Text-to-Speech-Dienst",
        },
        inputVoiceDescription: {
            'default': "Enter the voice name exactly as the provider specifies it.\nFor the correct spelling see the provider documentation of the service you specified above.",
            'deDE': "Geben Sie die Stimmbezeichnung genau so ein, wie der Hersteller ihn angibt.\nDie korrekte Schreibweise finden Sie in der Dokumentation des Herstellers, den Sie oben angegeben haben.",
        },
        inputVoiceFallbackLabel: {
            'default': "Provider specific voice name for fallback service",
            'deDE': "Stimmenbezeichnung des Herstellers für den Fallback-Dienst",
        },
        inputVoiceLabel: {
            'default': "Provider specific voice name for default service",
            'deDE': "Stimmenbezeichnung des Herstellers für den Standarddienst",
        },
    },
    timer: {
        enableTimerDescription: {
            'default': "To activate the Inactivity Timeout, activate this setting.",
            'deDE': "Um die Zeitüberschreitung bei Inaktivität zu aktivieren, aktivieren Sie diese Einstellung.",
        },
        enableTimerLabel: {
            'default': "Enable or disable the inactivity timer",
            'deDE': "Inaktivitätstimer aktivieren oder deaktivieren",
        },
        nodeLabel: {
            'default': "Inactivity Timeout",
            'deDE': "Zeitüberschreitung bei Inaktivität",
        },
        nodeSummary: {
            'default': "Sets the Inactivity Timeout in seconds",
            'deDE': "Legt die Zeitüberschreitung bei Inaktivität in Sekunden fest",
        },
        useStartInputsLabel: {
            'default': "Activate Inactivity Timeout (in s)",
            'deDE': "Zeitüberschreitung bei Inaktivität (in s) aktivieren",
        },
    },
};