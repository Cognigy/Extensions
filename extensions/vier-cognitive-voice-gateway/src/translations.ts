/* tslint:disable:quotemark */
// This code is generated!
export default {
    bridge: {
        inputExtensionLengthDescription: {
            'default': "Select the size of the extension range from which VIER Cognitive Voice Gateway should select a phone number from.",
            'deDE': "Wählen Sie die Größe des Durchwahlen-Bereiches, aus dem VIER Cognitive Voice Gateway eine Rufnummer wählen soll.",
        },
        inputExtensionLengthLabel: {
            'default': "Extension Length",
            'deDE': "Durchwahl-Länge",
            'esES': "Longueur de l'extension",
        },
        inputHeadNumberDescription: {
            'default': "Enter the prefix of the phone number the call should be forwarded to.",
            'deDE': "Geben Sie die Vorwahl der Rufnummer ein, an die der Anruf weitergeleitet werden soll.",
        },
        inputHeadNumberLabel: {
            'default': "Phone Number Prefix",
            'deDE': "Rufnummernvorwahl",
            'esES': "Préfixe du numéro de téléphone",
        },
        inputMaxDigitsDescription: {
            'default': "Enter the maximum amount of digits the phone number can have. If set, the input ends once the maximum has been reached.",
            'deDE': "Geben Sie ein, wie viele Ziffern die Rufnummer maximal haben darf. Wenn diese Option aktiviert ist, endet die Eingabe, sobald die maximale Anzahl erreicht ist.",
        },
        nodeLabel: {
            'default': "Forward Call to a Contact Center",
            'deDE': "Anruf an ein Contact Center weiterleiten",
            'esES': "Transférer l'appel vers un centre de contact",
        },
        nodeSummary: {
            'default': "Forward the call to a contact center for agent assistance",
            'deDE': "Anruf an ein Contact Center zur Unterstützung durch eine:n Agent:in weiterleiten",
            'esES': "Transférer l'appel vers un centre de contact pour l'assistance d'un agent",
        },
    },
    forward: {
        inputDestinationNumberDescription: {
            'default': "Enter the phone number you want to forward the call to (with country code, e.g. +49721480848680).",
            'deDE': "Geben Sie die Rufnummer ein, an die weitergeleitet werden soll (mit Ländervorwahl, z. B. +49721480848680).",
        },
        inputDestinationNumberLabel: {
            'default': "Destination Phone Number",
            'deDE': "Ziel-Rufnummer",
            'esES': "Numéro d'appel cible",
        },
        nodeLabel: {
            'default': "Forward Call",
            'deDE': "Anruf weiterleiten",
            'esES': "Transférer l'appel",
        },
        nodeSummary: {
            'default': "Forward the call to a different destination",
            'deDE': "Anruf an ein anderes Ziel weiterleiten",
            'esES': "Transférer l'appel vers une autre destination",
        },
        sectionAdditionalDataLabel: {
            'default': "Data",
            'deDE': "Daten",
            'esES': "Données",
        },
        sectionAdditionalSettingsLabel: {
            'default': "Additional Settings",
            'deDE': "Zusätzliche Einstellungen",
            'esES': "Paramètres supplémentaires",
        },
        sectionCallLabel: {
            'default': "Call Settings",
            'deDE': "Anruf-Einstellungen",
            'esES': "Paramètres d'appel",
        },
        sectionGeneralLabel: {
            'default': "General Settings",
            'deDE': "Allgemeine Einstellungen",
            'esES': "Paramètres généraux",
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
            'default': "Get Multiple Choice Answer from Caller",
            'deDE': "Multiple-Choice-Antwort von dem:der Anrufer:in erhalten",
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
            'default': "The fallback text is used when the audio playback did not succeed.",
            'deDE': "Der Fallback-Text wird verwendet, wenn das Audio-File nicht abgespielt werden kann.",
        },
        inputFallbackTextLabel: {
            'default': "Fallback Text",
            'deDE': "Fallback-Text",
        },
        inputUrlLabel: {
            'default': "Audio URL",
            'deDE': "Audio-URL",
            'esES': "URL audio",
        },
        inputUrlLabelDescription: {
            'default': "Enter the location of the audio file. \nAllowed formats: Linear PCM with signed 16 bits (8 kHz or 16 kHz), A-law or µ-law 8 kHz.",
            'deDE': "Geben Sie den Speicherort für die Audiodatei ein. Erlaubte Formate: Linear-PCM mit vorzeichenbehafteten 16 Bit (8 kHz oder 16 kHz), A-law oder µ-law 8 kHz.",
        },
        nodeLabel: {
            'default': "Play Audio File",
            'deDE': "Audiodatei abspielen",
            'esES': "Lire le fichier audio",
        },
        nodeSummary: {
            'default': "Play an audio file to the call",
            'deDE': "Audiodatei für den Anruf abspielen",
            'esES': "Lire un fichier audio lors de l'appel",
        },
    },
    promptForNumber: {
        inputMaxDigitsDescription: {
            'default': "Enter the maximum number of digits the phone number can have. If this option is enabled, the input ends as soon as the maximum number is reached.",
            'deDE': "Geben Sie ein, wie viele Ziffern die Rufnummer maximal haben darf. Wenn diese Option aktiviert ist, endet die Eingabe, sobald die maximale Anzahl erreicht ist.",
        },
        nodeLabel: {
            'default': "Get Number from Caller",
            'deDE': "Nummer von dem:der Anrufer:in erhalten",
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
            'default': "Maximum Call Recording Duration (s)",
            'deDE': "Maximale Dauer der Gesprächsaufzeichnung (in s)",
        },
        inputSpeakersLabel: {
            'default': "Speakers to record",
            'deDE': "Aufzuzeichnende Sprecher:innen",
        },
        nodeLabel: {
            'default': "Start Call Recording",
            'deDE': "Gesprächsaufzeichnung starten",
            'esES': "Démarrer l'enregistrement d'appel",
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
            'esES': "Pour arrêter l'enregistrement d'appel plutôt que de le mettre en pause, activez cette case à cocher.",
        },
        inputTerminateLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
            'esES': "Arrêter l'enregistrement d'appel",
        },
        nodeLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
            'esES': "Arrêter l'enregistrement d'appel",
        },
        nodeSummary: {
            'default': "Pause or stop recording of a call",
            'deDE': "Gesprächsaufzeichnung anhalten oder beenden",
            'esES': "Pause ou arrêt de l'enregistrement d'un appel",
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
            'esES': "Envoyer des données",
        },
        nodeSummary: {
            'default': "Attach custom data to a dialog",
            'deDE': "Benutzerdefinierte Daten an einen Dialog anhängen",
            'esES': "Attacher des données personnalisées à un dialogue",
        },
    },
    shared: {
        childDefaultLabel: {
            'default': "Default",
            'deDE': "Default",
            'esES': "Par défaut",
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
            'default': "The bot accepts answering machines picking up the calls.",
            'deDE': "Der Bot akzeptiert Anrufbeantworter, die die Anrufe entgegennehmen.",
        },
        inputAcceptAnsweringMachinesLabel: {
            'default': "Accept Answering Machines",
            'deDE': "Anrufbeantworter akzeptieren",
        },
        inputBargeInOnDtmfDescription: {
            'default': "Allows the audio to be interrupted by pressing keys",
        },
        inputBargeInOnDtmfLabel: {
            'default': "Barge-In on DTMF",
        },
        inputBargeInOnSpeechDescription: {
            'default': "Allows the audio to be interrupted by the speaker",
        },
        inputBargeInOnSpeechLabel: {
            'default': "Barge-In on Speech",
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
            'deDE': "Benutzerdefinierte SIP-Header",
        },
        inputDataDescription: {
            'default': "Enter an object with key-value pairs that should be attached as custom data to the dialog.",
            'deDE': "Geben Sie ein Objekt mit Schlüssel-Wert-Paaren ein, das als benutzerdefinierte Daten an den Dialog angehängt werden sollen.",
        },
        inputDataLabel: {
            'default': "Custom Data",
            'deDE': "Benutzerdefinierte Daten",
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
            'default': "To play a ringing tone during a pending call, activate this checkbox. This setting will change in the future.",
            'deDE': "Um während eines Anrufes, der sich im Rufaufbau befindet, ein Kingelton abzuspielen, aktivieren Sie diese Checkbox. Diese Einstellung wird sich in Zukunft ändern.",
        },
        inputExperimentalEnableRingingToneLabel: {
            'default': "(EXPERIMENTAL) Enable Ringing Tone",
            'deDE': "(EXPERIMENTAL) Klingelton aktivieren",
        },
        inputInterpretAsDescription: {
            'default': "Specify whether the text should be interpreted as text or SSML markup.",
            'deDE': "Legen Sie fest, ob der Text als Text oder SSML-Auszeichnung interpretiert werden soll.",
        },
        inputInterpretAsLabel: {
            'default': "Interpret as",
            'deDE': "Interpretieren als",
        },
        inputLanguageDescription: {
            'default': "To overwrite the Text-to-Speech language for specific messages, enter the language you want.",
            'deDE': "Um die Text-to-Speech-Sprache für bestimmte Nachrichten zu überschreiben, geben Sie die gewünschte Sprache ein.",
        },
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
            'esES': "Langue",
        },
        inputMaxDigitsLabel: {
            'default': "Maximum Allowed Digits",
            'deDE': "Maximal erlaubte Ziffernanzahl",
        },
        inputRecordingIdDescription: {
            'default': "Enter an arbitrary string to identify the call recording if multiple call recordings are created in the same dialog.",
            'deDE': "Geben Sie einen beliebigen String zur Identifizierung der Gesprächsaufzeichnung ein, wenn mehrere Gesprächsaufzeichnungen im selben Dialog erstellt werden.",
        },
        inputRecordingIdLabel: {
            'default': "Call Recording ID",
            'deDE': "Gesprächsaufzeichnungs-ID",
            'esES': "Identifiant d’enregistrement d’appel",
        },
        inputRingTimeoutDescription: {
            'default': "Enter the maximum time in seconds that the call should ring before the call attempt is canceled.",
            'deDE': "Geben Sie die maximale Zeit in Sekunden ein, die der Anruf läuten soll, bevor der Anrufversuch abgebrochen wird.",
        },
        inputRingTimeoutLabel: {
            'default': "Ring Timeout (s)",
            'deDE': "Zeitüberschreitung beim Klingeln (s)",
        },
        inputSubmitInputsDescription: {
            'default': "Select one or more characters with which the caller should confirm the phone number input. Allowed are digits from 0-9 and the special characters * and #. You can enter only one character per line.",
            'deDE': "Wählen Sie ein oder mehrere Zeichen, mit dem der:die Anrufer:in die Rufnummerneingabe bestätigen soll. Erlaubt sind 0-9, * und #. Pro Zeile können Sie nur ein Zeichen eingeben.",
        },
        inputSubmitInputsLabel: {
            'default': "Submit Inputs",
            'deDE': "Eingaben übermitteln",
        },
        inputSynthesizersDescription: {
            'default': "If specified, this parameter overwrites the Text-to-Speech list from the project settings.",
            'deDE': "Sofern angegeben, überschreibt dieser Parameter die Text-to-Speech-Liste aus den Projekteinstellungen.",
        },
        inputSynthesizersLabel: {
            'default': "Text-to-Speech Profiles",
            'deDE': "Text-to-Speech-Profile",
            'esES': "Profils de synthèse texte-parole",
        },
        inputTextDescription: {
            'default': "Enter the message to introduce the prompt to the caller.",
            'deDE': "Geben Sie die Nachricht ein, mit der dem:der Anrufer:in die Eingabeaufforderung vorgestellt werden soll.",
        },
        inputTextLabel: {
            'default': "Message",
            'deDE': "Nachricht",
            'esES': "Message",
        },
        inputTimeoutDescription: {
            'default': "Enter the duration in seconds after which the prompt should be cancelled.",
            'deDE': "Geben Sie die Dauer in Sekunden an, nach der die Eingabeaufforderung abgebrochen werden soll.",
        },
        inputTimeoutLabel: {
            'default': "Timeout",
            'deDE': "Zeitüberschreitung",
            'esES': "Temporisation",
        },
        inputUseMaxDigitsDescription: {
            'default': "To use the \"Maximum Digits\" property as a stop condition, activate this checkbox.",
            'deDE': "Um die Eigenschaft „Maximale Ziffernanzahl“ als Stoppbedingung zu verwenden, aktivieren Sie diese Checkbox.",
        },
        inputUseMaxDigitsLabel: {
            'default': "Use Maximum Digits",
            'deDE': "Maximale Ziffernanzahl verwenden",
        },
        inputUseSubmitInputsDescription: {
            'default': "To use the \"Submit Inputs\" property as a stop condition, activate this checkbox.",
            'deDE': "Um die Eigenschaft „Eingaben übermitteln” als Stoppbedingung zu verwenden, aktivieren Sie diese Checkbox.",
        },
        inputUseSubmitInputsLabel: {
            'default': "Use Submit Inputs",
            'deDE': "Eingaben übermitteln verwenden",
        },
        inputWhisperingTextDescription: {
            'default': "Enter the text that should be announced to the agent the call is transfered to before the call parties are connected.",
            'deDE': "Geben Sie den Text ein, der dem:der Agent:in bei der Weiterleitung angesagt werden soll, bevor die Gesprächsteilnehmer:innen verbunden werden.",
        },
        inputWhisperingTextLabel: {
            'default': "Whispering Announcement",
            'deDE': "Whispering-Ansage",
            'esES': "Annonce d'appel",
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
            'esES': "Texte supplémentaire",
        },
        inputTextLabel: {
            'default': "Text",
            'deDE': "Text",
            'esES': "Texte",
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
            'esES': "Section de texte supplémentaire",
        },
    },
    speechToText: {
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
            'esES': "Langue",
        },
        inputProfileTokenDescription: {
            'default': "Please use the profile token as displayed in VIER Cognitive Voice Gateway, Speech Service Profiles",
            'deDE': "Bitte verwenden Sie das Profiltoken, wie es in VIER Cognitive Voice Gateway, Sprachdienst-Profile, angezeigt wird",
        },
        inputProfileTokenFallbackDescription: {
            'default': "Profile Token Fallback",
            'deDE': "Profil-Token-Fallback",
        },
        inputProfileTokenFallbackLabel: {
            'default': "Profile Token Fallback",
            'deDE': "Profil-Token-Fallback",
        },
        inputProfileTokenLabel: {
            'default': "Profile Token",
            'deDE': "Profil-Token",
            'esES': "Jeton de profil",
        },
        inputServiceFallbackLabel: {
            'default': "Speech-to-Text Service Fallback",
            'deDE': "Fallback für Speech-to-Text-Dienst",
        },
        inputServiceLabel: {
            'default': "Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst",
            'esES': "Service de transcription de la parole",
        },
        inputTranscriberDescription: {
            'default': "Type in one of the follow Speech-to-Text Services: 'GOOGLE', 'IBM', 'MICROSOFT' or leave empty to set a service via profile token",
            'deDE': "Geben Sie einen der folgenden Speech-to-Text-Dienste ein: 'GOOGLE', 'IBM', 'MICROSOFT' oder lassen Sie das Feld leer, um über das Profiltoken einen Dienst festzulegen",
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
            'esES': "Sélectionner la langue",
        },
        sectionSelectSTTLabel: {
            'default': "Select Speech-to-Text Services",
            'deDE': "Speech-to-Text-Dienste wählen",
            'esES': "Sélectionner les services de transcription de la parole",
        },
    },
    terminate: {
        nodeLabel: {
            'default': "End Call",
            'deDE': "Anruf beenden",
            'esES': "Terminer l'appel",
        },
        nodeSummary: {
            'default': "Cancel the call",
            'deDE': "Anruf abbrechen",
            'esES': "Annuler l'appel",
        },
    },
    timer: {
        inputTimeoutStartDescription: {
            'default': "The Inactivity Timeout can only be set, if not already in the VIER Cognitive Voice Gateway project settings duration",
            'deDE': "Die Zeitüberschreitung bei Inaktivität kann nur eingestellt werden, wenn sie nicht bereits in den Projekteinstellungen von VIER Cognitive Voice Gateway hinterlegt ist",
        },
        inputTimeoutStopDescription: {
            'default': "Stops the Inactivity Timeout detection",
            'deDE': "Stoppt die Zeitüberschreitungs-Erkennung bei Inaktivität",
        },
        nodeLabel: {
            'default': "Inactivity Timeout",
            'deDE': "Zeitüberschreitung bei Inaktivität",
        },
        nodeSummary: {
            'default': "Sets the Inactivity Timeout in (s)",
            'deDE': "Legt die Zeitüberschreitung bei Inaktivität (s) fest",
        },
        selectTimerLabel: {
            'default': "Select Timeout",
            'deDE': "Zeitüberschreitung einstellen",
        },
        useStartInputsLabel: {
            'default': "Activate Inactivity Timeout (s)",
            'deDE': "Zeitüberschreitung bei Inaktivität (in s) aktivieren",
        },
        useStopInputsLabel: {
            'default': "Deactivate Inactivity Timeout (s)",
            'deDE': "Zeitüberschreitung bei Inaktivität (in s) deaktivieren",
        },
    },
};