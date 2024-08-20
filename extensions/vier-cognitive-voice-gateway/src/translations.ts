/* tslint:disable:quotemark */
// This code is generated!
export default {
    aggregateInput: {
        enableFieldDescription: {
            'default': "To activate the aggregation of utterances, activate this switch.",
            'deDE': "Um die Aggregation von Aussagen einzuschalten, aktivieren Sie diesen Schalter.",
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
            'deDE': "Zeit in (s), nach der die Aggregation der Aussagen endet",
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
                'deDE': "Damit der:dieGesprächspartner:in den Bot durch Drücken von Tasten unterbrechen kann, aktivieren Sie diese Checkbox.",
            },
            onDtmfLabel: {
                'default': "By pressing keys",
                'deDE': "Durch Drücken von Tasten",
            },
            onSpeechDescription: {
                'default': "To allow the call partner to interrupt the bot by speaking, select this checkbox.",
                'deDE': "Damit der:die Gesprächspartner:in den Bot durch Sprechen unterbrechen kann, aktivieren Sie diese Checkbox.",
            },
            onSpeechLabel: {
                'default': "By speaking",
                'deDE': "Durch Sprechen",
            },
            phraseListDescription: {
                'default': "Enter the words and phrases that trigger a barge-in.",
                'deDE': "Geben Sie die Wörter und Sätze ein, die ein Barge-in auslösen sollen.",
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
            'default': "To stop the call recording rather than to pause, activate this checkbox.",
            'deDE': "Um die Gesprächsaufzeichnung zu beenden und nicht zu unterbrechen, aktivieren Sie diese Checkbox.",
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
            'default': "To stop the flow after executing this node, activate this checkbox.",
            'deDE': "Um den Flow nach der Ausführung dieses Knotens zu stoppen, aktivieren Sie diese Checkbox.",
        },
        inputEndFlowLabel: {
            'default': "Quit Flow",
            'deDE': "Flow beenden",
        },
        inputExperimentalEnableRingingToneDescription: {
            'default': "To play a ringing tone during a pending call, activate this checkbox. This setting may change in the future.",
            'deDE': "Um während eines Anrufes, der sich im Rufaufbau befindet, einen Klingelton abzuspielen, aktivieren Sie diese Checkbox. Hinweis! Diese Einstellung kann sich in Zukunft ändern.",
        },
        inputExperimentalEnableRingingToneLabel: {
            'default': "Enable Ringing Tone",
            'deDE': "Klingelton aktivieren",
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
            'default': "If specified, this parameter overwrites the Text-to-Speech list from the project settings.",
            'deDE': "Sofern angegeben, überschreibt dieser Parameter die Text-to-Speech-Liste aus den Projekteinstellungen.",
        },
        inputSynthesizersLabel: {
            'default': "Text-to-Speech Profiles",
            'deDE': "Text-to-Speech-Profile",
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
            'default': "User-To-User Information",
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
            'default': "SIP",
        },
        sectionStopConditionLabel: {
            'default': "Stop Condition",
            'deDE': "Stoppbedingung",
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
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
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
            'default': "Type in one of the follow Speech-to-Text Services: 'GOOGLE', 'IBM', 'MICROSOFT' or leave empty to set a service via profile token.",
            'deDE': "Geben Sie einen der folgenden Speech-to-Text-Dienste ein: 'GOOGLE', 'IBM', 'MICROSOFT' oder lassen Sie das Feld leer, um über das Profiltoken einen Dienst festzulegen.",
        },
        nodeLabel: {
            'default': "Set Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst festlegen",
        },
        nodeSummary: {
            'default': "Speech-to-Text services need to be used to transcribe the expected input in the best possible way",
            'deDE': "Speech-to-Text-Dienste müssen verwendet werden, um die erwartete Eingabe bestmöglich zu transkribieren",
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
    timer: {
        enableTimerDescription: {
            'default': "To activate the Inactivity Timeout, activate this switch.",
            'deDE': "Um die Zeitüberschreitung bei Inaktivität zu aktivieren, aktivieren Sie diesen Schalter.",
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