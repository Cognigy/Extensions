/* tslint:disable:quotemark */
// This code is generated!
export default {
    bridge: {
        inputExtensionLengthDescription: {
            'default': "Select the size of the extension range from which VIER Cognitive Voice Gateway should select a phone number from.",
            'deDE': "Wählen Sie die Größe des Durchwahlen-Bereiches, aus dem VIER Cognitive Voice Gateway eine Rufnummer wählen soll.",
            'esES': "Sélectionner la longueur du numéro direct à partir de laquelle VIER Cognitive Voice Gateway doit composer un numéro d'appel.",
        },
        inputExtensionLengthLabel: {
            'default': "Extension Length",
            'deDE': "Durchwahl-Länge",
            'esES': "Longueur du numéro direct",
        },
        inputHeadNumberDescription: {
            'default': "Enter the prefix of the phone number the call should be forwarded to.",
            'deDE': "Geben Sie die Vorwahl der Rufnummer ein, an die der Anruf weitergeleitet werden soll.",
            'esES': "Saisir l'indicatif du numéro d'appel vers lequel l'appel doit être transféré.",
        },
        inputHeadNumberLabel: {
            'default': "Phone Number Prefix",
            'deDE': "Rufnummernvorwahl",
            'esES': "Préfixe du numéro d'appel",
        },
        inputMaxDigitsDescription: {
            'default': "Enter the maximum amount of digits the phone number can have. If set, the input ends once the maximum has been reached.",
            'deDE': "Geben Sie ein, wie viele Ziffern die Rufnummer maximal haben darf. Wenn diese Option aktiviert ist, dann endet die Eingabe, sobald die maximale Anzahl erreicht ist.",
            'esES': "Saisir le nombre maximal de chiffres que doit comporter le numéro d'appel. Lorsque cette option est activée, la saisie se termine dès que le nombre maximal est atteint.",
        },
        nodeLabel: {
            'default': "Forward Call to a Contact Center",
            'deDE': "Anruf an ein Contact Center weiterleiten",
            'esES': "Transférer l'appel vers un centre de contact",
        },
        nodeSummary: {
            'default': "Forward the call to a contact center for agent assistance",
            'deDE': "Anruf an ein Contact Center zur Unterstützung durch eine:n Agent:in weiterleiten",
            'esES': "Transférer l'appel vers un centre de contact pour assistance par un agent",
        },
    },
    forward: {
        inputDestinationNumberDescription: {
            'default': "Enter the phone number you want to forward the call to (with country code, e.g. +49721480848680).",
            'deDE': "Geben Sie die Rufnummer ein, an die weitergeleitet werden soll (mit Ländervorwahl, z. B. +49721480848680).",
            'esES': "Saisir le numéro d'appel pour le transfert d'appels (avec l'indicatif du pays, p. ex. +49721480848680).",
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
            'esES': "Ajouter des mots et leurs synonymes si nécessaire et les appliquer.",
        },
        inputChoicesLabel: {
            'default': "Choices",
            'deDE': "Auswahlmöglichkeiten",
            'esES': "Choix",
        },
        nodeLabel: {
            'default': "Get Multiple Choice Answer from Caller",
            'deDE': "Multiple-Choice-Antwort von dem:der Anrufer:in erhalten",
            'esES': "Obtenir une réponse à choix multiple de l'appelant",
        },
        nodeSummary: {
            'default': "Say something to the call with a multiple choice prompt",
            'deDE': "Dem:Der Anrufer:in etwas mit einer Multiple-Choice-Aufforderung sagen",
            'esES': "Poser une question à choix multiple à l'appelant",
        },
        sectionChoicesSectionLabel: {
            'default': "Choices",
            'deDE': "Auswahlmöglichkeiten",
            'esES': "Choix",
        },
    },
    outboundService: {
        nodeLabel: {
            'default': "Check Call Forwarding Result",
            'deDE': "Ergebnis der Anrufweiterleitung prüfen",
            'esES': "Vérifier le résultat du transfert d'appel",
        },
        nodeSummary: {
            'default': "Check the Result of the Previous Call Forwarding",
            'deDE': "Ergebnis der vorherigen Anrufweiterleitung prüfen",
            'esES': "Vérifier le résultat du précédent transfert d'appel",
        },
    },
    play: {
        inputFallbackTextDescription: {
            'default': "Enter the text to be announced when the audio file cannot be played.",
            'deDE': "Geben Sie den Text ein, der verwendet werden soll, wenn die Audiodatei nicht abgespielt werden kann.",
            'esES': "Saisir un texte à utiliser lorsque le fichier ne peut pas être lu.",
        },
        inputFallbackTextLabel: {
            'default': "Fallback Text",
            'deDE': "Fallback-Text",
            'esES': "Texte de secours",
        },
        inputUrlLabel: {
            'default': "Audio file URL",
            'deDE': "Audiodatei-URL",
            'esES': "URL du fichier audio",
        },
        inputUrlLabelDescription: {
            'default': "Enter the location of the audio file. \nAllowed formats: Linear PCM with signed 16 bits (8 kHz or 16 kHz), A-law or µ-law 8 kHz.",
            'deDE': "Geben Sie den Speicherort für die Audiodatei ein. Erlaubte Formate: Linear-PCM mit vorzeichenbehafteten 16 Bit (8 kHz oder 16 kHz), A-law oder µ-law 8 kHz.",
            'esES': "Saisir l'emplacement d'enregistrement du fichier audio. Formats autorisés : PCM linéaire avec 16 bits (8 kHz ou 16 kHz) avec signe, loi A ou loi µ 8 kHz.",
        },
        nodeLabel: {
            'default': "Play Audio File",
            'deDE': "Audiodatei abspielen",
            'esES': "Lire un fichier audio",
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
            'esES': "Saisir le nombre maximal de chiffres que doit comporter le numéro d'appel. Lorsque cette option est activée, la saisie se termine dès que le nombre maximal est atteint.",
        },
        nodeLabel: {
            'default': "Get Number from Caller",
            'deDE': "Nummer von dem:der Anrufer:in erhalten",
            'esES': "Obtenir le numéro de l'appelant",
        },
        nodeSummary: {
            'default': "Say something to the caller with a prompt to enter a number",
            'deDE': "Dem:Der Anrufer:in etwas mitteilen und ihn:sie auffordern, eine Nummer einzugeben",
            'esES': "Donner des informations à l'appelant et lui demander de transmettre son numéro",
        },
    },
    recordingStart: {
        inputMaxDurationDescription: {
            'default': "Select the maximum call recording duration in seconds, after which the call recording will be stopped automatically.",
            'deDE': "Wählen Sie die maximale Dauer der Gesprächsaufzeichnung in Sekunden, nach der die Gesprächsaufzeichnung automatisch beendet werden soll.",
            'esES': "Sélectionner la durée maximale de l'enregistrement de conversation en secondes, au terme de laquelle l'enregistrement prend automatiquement fin.",
        },
        inputMaxDurationLabel: {
            'default': "Maximum Call Recording Duration (in s)",
            'deDE': "Maximaldauer der Gesprächsaufzeichnung (in s)",
            'esES': "Durée maximale de l'enregistrement de conversation (en s)",
        },
        inputSpeakersAgentLabel: {
            'default': "Agent",
            'deDE': "Agent:in",
            'esES': "Agent",
        },
        inputSpeakersBothLabel: {
            'default': "Both Call Partners",
            'deDE': "Beide Gesprächspartner:innen",
            'esES': "Les deux correspondants",
        },
        inputSpeakersCustomerLabel: {
            'default': "Customer",
            'deDE': "Kund:in",
            'esES': "Client",
        },
        inputSpeakersLabel: {
            'default': "Speaker to record",
            'deDE': "Aufzuzeichnende:r Sprecher:in",
            'esES': "Locuteur à enregistrer",
        },
        nodeLabel: {
            'default': "Start Call Recording",
            'deDE': "Gesprächsaufzeichnung starten",
            'esES': "Démarrer l'enregistrement de conversation",
        },
        nodeSummary: {
            'default': "Start or resume recording of a call",
            'deDE': "Aufzeichnung eines Anrufs starten oder fortsetzen",
            'esES': "Démarrer ou poursuivre l'enregistrement d'appel",
        },
    },
    recordingStop: {
        inputTerminateDescription: {
            'default': "To stop the call recording rather than to pause, activate this checkbox.",
            'deDE': "Um die Gesprächsaufzeichnung zu beenden und nicht zu unterbrechen, aktivieren Sie diese Checkbox.",
            'esES': "Pour terminer l'enregistrement de conversation plutôt que de le mettre en pause, cocher cette case.",
        },
        inputTerminateLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
            'esES': "Arrêter l'enregistrement de conversation",
        },
        nodeLabel: {
            'default': "Stop Call Recording",
            'deDE': "Gesprächsaufzeichnung stoppen",
            'esES': "Arrêter l'enregistrement de conversation",
        },
        nodeSummary: {
            'default': "Pause or stop recording of a call",
            'deDE': "Gesprächsaufzeichnung anhalten oder beenden",
            'esES': "Mettre en pause ou terminer l'enregistrement de conversation",
        },
    },
    sendData: {
        inputDataDescription: {
            'default': "Enter an object with arbitrary properties. Each property must have a string value.",
            'deDE': "Geben Sie ein Objekt mit beliebigen Eigenschaften ein. Jede Eigenschaft muss einen String-Wert haben.",
            'esES': "Saisir un objet avec les propriétés souhaitées. Chaque propriété doit présenter une valeur de chaîne.",
        },
        nodeLabel: {
            'default': "Send Data",
            'deDE': "Daten senden",
            'esES': "Envoyer des données",
        },
        nodeSummary: {
            'default': "Attach custom data to a dialog",
            'deDE': "Benutzerdefinierte Daten an einen Dialog anhängen",
            'esES': "Joindre des données définies par l'utilisateur à un dialogue",
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
            'esES': "On Failure",
        },
        childSuccessLabel: {
            'default': "On Success",
            'deDE': "On Success",
            'esES': "On Success",
        },
        childTerminationLabel: {
            'default': "On Termination",
            'deDE': "On Termination",
            'esES': "On Termination",
        },
        inputAcceptAnsweringMachinesDescription: {
            'default': "If enabled, the bot will accept answering machines picking up the calls.",
            'deDE': "Wenn diese Option aktiviert ist, dann akzeptiert der Bot Anrufbeantworter, die die Anrufe entgegennehmen.",
            'esES': "Lorsque cette option est activée, le bot accepte le transfert des appels vers le répondeur.",
        },
        inputAcceptAnsweringMachinesLabel: {
            'default': "Accept Answering Machines",
            'deDE': "Anrufbeantworter akzeptieren",
            'esES': "Accepter le répondeur",
        },
        inputBargeInOnDtmfDescription: {
            'default': "To allow the caller to interrupt the audio file by pressing keys, activate this checkbox.",
            'deDE': "Damit der:die Anrufer:in die Audiodatei durch Drücken von Tasten unterbrechen kann, aktivieren Sie diese Checkbox.",
            'esES': "Afin que l'appelant puisse interrompre le fichier audio en appuyant sur les touches, cocher cette case.",
        },
        inputBargeInOnDtmfLabel: {
            'default': "Allow the caller to interrupt the audio file by pressing keys",
            'deDE': "Dem:Der Anrufer:in erlauben, die Audiodatei durch Drücken von Tasten zu unterbrechen",
            'esES': "Permettre à l'appelant d'interrompre le fichier audio en appuyant sur les touches",
        },
        inputBargeInOnSpeechDescription: {
            'default': "To allow the speaker to interrupt the audio file, activate this checkbox.",
            'deDE': "Damit der:die Sprecher:in die Audiodatei unterbrechen kann, aktivieren Sie diese Checkbox.",
            'esES': "Afin que le locuteur puisse interrompre le fichier audio, cocher cette case.",
        },
        inputBargeInOnSpeechLabel: {
            'default': "Allow the speaker to interrupt the audio file by speaking",
            'deDE': "Dem:Der Sprecher:in erlauben, die Audiodatei durch Sprechen zu unterbrechen",
            'esES': "Permettre au locuteur d’interrompre le fichier audio pendant la conversation",
        },
        inputCallerIdDescription: {
            'default': "Enter the phone number that should be displayed to the callee. (This is a best-effort option. A correct display can not be guaranteed.)",
            'deDE': "Geben Sie die Rufnummer ein, die dem:der Angerufenen angezeigt werden soll. (Dies ist eine Best-Effort-Option. Eine korrekte Anzeige kann nicht garantiert werden.)",
            'esES': "Saisir le numéro d'appel qui doit s'afficher pour l'appelant. (Il s’agit d'une option Best-Effort. L'affichage correct ne peut pas être garanti.)",
        },
        inputCallerIdLabel: {
            'default': "Displayed Caller ID",
            'deDE': "Angezeigte Anrufer-ID",
            'esES': "ID d’appelant affiché",
        },
        inputCustomSipHeadersDescription: {
            'default': "Enter an object where each property is the name of a header, and the value is a list of strings. All header names must begin with X-.",
            'deDE': "Geben Sie ein Objekt ein, bei dem jede Eigenschaft der Name eines Headers ist und der Wert eine Liste von Strings ist. Alle Header-Namen müssen mit X- beginnen.",
            'esES': "Saisir un objet où chaque caractéristique est le nom d'un en-tête et la valeur est une liste de chaînes. Tous les noms d'en-têtes doivent commencer par X.",
        },
        inputCustomSipHeadersLabel: {
            'default': "Custom SIP Headers",
            'deDE': "Custom-SIP-Header",
            'esES': "En-tête SIP défini par l'utilisateur",
        },
        inputDataDescription: {
            'default': "Enter an object with key-value pairs that should be attached as custom data to the dialog.",
            'deDE': "Geben Sie ein Objekt mit Schlüssel-Wert-Paaren ein, das als benutzerdefinierte Daten an den Dialog angehängt werden sollen.",
            'esES': "Saisir un objet avec les paires clés-valeurs devant être jointes au dialogue en tant que données définies par l'utilisateur.",
        },
        inputDataLabel: {
            'default': "Custom Data",
            'deDE': "Benutzerdefinierte Daten",
            'esES': "Données définies par l'utilisateur",
        },
        inputEndFlowDescription: {
            'default': "To stop the flow after executing this node, activate this checkbox.",
            'deDE': "Um den Flow nach der Ausführung dieses Knotens zu stoppen, aktivieren Sie diese Checkbox.",
            'esES': "Pour mettre fin au flow après exécution de ce nœud, cocher cette case.",
        },
        inputEndFlowLabel: {
            'default': "Quit Flow",
            'deDE': "Flow beenden",
            'esES': "Terminer le flow",
        },
        inputExperimentalEnableRingingToneDescription: {
            'default': "To play a ringing tone during a pending call, activate this checkbox. This setting may change in the future.",
            'deDE': "Um während eines Anrufes, der sich im Rufaufbau befindet, einen Klingelton abzuspielen, aktivieren Sie diese Checkbox. Hinweis! Diese Einstellung kann sich in Zukunft ändern.",
            'esES': "Cocher cette case pour jouer une sonnerie pendant un appel en cours de numérotation. Remarque ! Ce réglage changera à l'avenir.",
        },
        inputExperimentalEnableRingingToneLabel: {
            'default': "Enable Ringing Tone",
            'deDE': "Klingelton aktivieren",
            'esES': "Activer la sonnerie (EXPÉRIMENTAL)",
        },
        inputInterpretAsDescription: {
            'default': "Specify whether the text should be interpreted as text or SSML markup.",
            'deDE': "Legen Sie fest, ob der Text als Text oder SSML-Auszeichnung interpretiert werden soll.",
            'esES': "Définir si le texte doit être interprété comme un texte ou un enregistrement SSML.",
        },
        inputInterpretAsLabel: {
            'default': "Interpret as",
            'deDE': "Interpretieren als",
            'esES': "Interpréter comme",
        },
        inputLanguageDescription: {
            'default': "To overwrite the Text-to-Speech language for specific messages, enter the language you want.",
            'deDE': "Um die Text-to-Speech-Sprache für bestimmte Nachrichten zu überschreiben, geben Sie die gewünschte Sprache ein.",
            'esES': "Pour écraser la langue de synthèse texte-parole pour certains messages, saisir la langue souhaitée.",
        },
        inputLanguageLabel: {
            'default': "Language",
            'deDE': "Sprache",
            'esES': "Langue",
        },
        inputMaxDigitsLabel: {
            'default': "Maximum Allowed Digits",
            'deDE': "Maximal erlaubte Ziffernanzahl",
            'esES': "Chiffres maximums autorisés",
        },
        inputRecordingIdDescription: {
            'default': "Enter an arbitrary string to identify the call recording if multiple call recordings are created in the same dialog.",
            'deDE': "Geben Sie einen beliebigen String zur Identifizierung der Gesprächsaufzeichnung ein, wenn mehrere Gesprächsaufzeichnungen im selben Dialog erstellt werden.",
            'esES': "Saisir la chaîne souhaitée pour identifier l'enregistrement de conversation lorsque plusieurs enregistrements de conversation sont créés dans le même dialogue.",
        },
        inputRecordingIdLabel: {
            'default': "Call Recording ID",
            'deDE': "Gesprächsaufzeichnungs-ID",
            'esES': "Identifiant d'enregistrement de conversation",
        },
        inputRingTimeoutDescription: {
            'default': "Enter the maximum time in seconds that the call should ring before the call attempt is canceled.",
            'deDE': "Geben Sie die maximale Zeit in Sekunden ein, die der Anruf läuten soll, bevor der Anrufversuch abgebrochen wird.",
            'esES': "Saisir la durée maximale en secondes pendant laquelle l'appel doit retentir avant d'être annulé.",
        },
        inputRingTimeoutLabel: {
            'default': "Ring Timeout (in s)",
            'deDE': "Zeitüberschreitung beim Klingeln (in s)",
            'esES': "Temporisation en cas de sonnerie (en s)",
        },
        inputSubmitInputsDescription: {
            'default': "Select one or more characters with which the caller should confirm the phone number input. Allowed are digits from 0-9 and the special characters * and #. You can enter only one character per line.",
            'deDE': "Wählen Sie ein oder mehrere Zeichen, mit dem der:die Anrufer:in die Rufnummerneingabe bestätigen soll. Erlaubt sind 0-9, * und #. Pro Zeile können Sie nur ein Zeichen eingeben.",
            'esES': "Sélectionner un ou plusieurs caractères avec lesquels l'appelant doit confirmer la saisie du numéro d'appel. Les caractères autorisés sont 0-9, * et #. Seul un caractère peut être saisi par ligne.",
        },
        inputSubmitInputsLabel: {
            'default': "Submit Inputs",
            'deDE': "Eingaben übermitteln",
            'esES': "Transmettre les saisies",
        },
        inputSynthesizersDescription: {
            'default': "If specified, this parameter overwrites the Text-to-Speech list from the project settings.",
            'deDE': "Sofern angegeben, überschreibt dieser Parameter die Text-to-Speech-Liste aus den Projekteinstellungen.",
            'esES': "S’il est spécifié, ce paramètre écrase la liste de synthèse texte-parole dans les paramètres du projet.",
        },
        inputSynthesizersLabel: {
            'default': "Text-to-Speech Profiles",
            'deDE': "Text-to-Speech-Profile",
            'esES': "Profils de synthèse texte-parole",
        },
        inputTextDescription: {
            'default': "Enter the message to introduce the prompt to the caller.",
            'deDE': "Geben Sie die Nachricht ein, mit der dem:der Anrufer:in die Eingabeaufforderung vorgestellt werden soll.",
            'esES': "Saisir le message qui s'affichera dans l’invite de commande pour l'appelant.",
        },
        inputTextLabel: {
            'default': "Message",
            'deDE': "Nachricht",
            'esES': "Message",
        },
        inputTimeoutDescription: {
            'default': "Enter the duration in seconds after which the prompt should be cancelled.",
            'deDE': "Geben Sie die Dauer in Sekunden an, nach der die Eingabeaufforderung abgebrochen werden soll.",
            'esES': "Saisir la durée en secondes après laquelle l'invite de commande sera interrompue.",
        },
        inputTimeoutLabel: {
            'default': "Timeout",
            'deDE': "Zeitüberschreitung",
            'esES': "Temporisation",
        },
        inputUseMaxDigitsDescription: {
            'default': "To use the \"Maximum Digits\" property as a stop condition, activate this checkbox.",
            'deDE': "Um die Eigenschaft „Maximale Ziffernanzahl“ als Stoppbedingung zu verwenden, aktivieren Sie diese Checkbox.",
            'esES': "Pour utiliser la propriété \"Chiffres maximums autorisés\" comme condition d'arrêt, activer cette case à cocher.",
        },
        inputUseMaxDigitsLabel: {
            'default': "Use Maximum Digits",
            'deDE': "„Maximale Ziffernanzahl“ verwenden",
            'esES': "Utiliser « Chiffres maximums autorisés »",
        },
        inputUseSubmitInputsDescription: {
            'default': "To use the \"Submit Inputs\" property as a stop condition, activate this checkbox.",
            'deDE': "Um die Eigenschaft „Eingaben übermitteln” als Stoppbedingung zu verwenden, aktivieren Sie diese Checkbox.",
            'esES': "Pour utiliser la propriété « Transmettre les saisies » comme condition d'arrêt, activer cette case à cocher.",
        },
        inputUseSubmitInputsLabel: {
            'default': "Use Submit Inputs",
            'deDE': "„Eingaben übermitteln“ verwenden",
            'esES': "Utiliser « Transmettre les saisies »",
        },
        inputWhisperingTextDescription: {
            'default': "Enter the text that should be announced to the agent the call is transfered to before the call partners are connected.",
            'deDE': "Geben Sie den Text ein, der dem:der Agent:in bei der Weiterleitung angesagt werden soll, bevor die Gesprächspartner:innen verbunden werden.",
            'esES': "Saisir le texte à annoncer à l'agent lors du transfert de l'appel avant que les correspandants ne soient connectés.",
        },
        inputWhisperingTextLabel: {
            'default': "Whispering Announcement",
            'deDE': "Whispering-Ansage",
            'esES': "Annonce d'un appel",
        },
        sectionStopConditionLabel: {
            'default': "Stop Condition",
            'deDE': "Stoppbedingung",
            'esES': "Condition d'arrêt",
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
            'esES': "Voix (avec formatage SSML)",
        },
        nodeSummary: {
            'default': "Speak something out to the caller with SSML support",
            'deDE': "Dem:Der Anrufer:in mit SSML-Unterstützung etwas vorsprechen",
            'esES': "Annoncer un message à l'appelant avec prise en charge SSML",
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
            'default': "Use the profile token as displayed in VIER Cognitive Voice Gateway under Speech service profiles > Profile token.",
            'deDE': "Verwenden Sie das Profiltoken, wie es in VIER Cognitive Voice Gateway unter Sprachdienst-Profile > Profiltoken angezeigt wird.",
            'esES': "Utiliser le jeton de profil comme affiché dans VIER Cognitive Voice Gateway sous Profils de service de langue >Jeton de profil.",
        },
        inputProfileTokenFallbackDescription: {
            'default': "Use the profile token as fallback, as displayed in VIER Cognitive Voice Gateway under Speech service profiles > Profile token.",
            'deDE': "Verwenden Sie das Profiltoken als Fallback, wie es in VIER Cognitive Voice Gateway unter Sprachdienst-Profile > Profiltoken angezeigt wird.",
            'esES': "Utiliser le jeton de profil en tant que texte de secours comme affiché dans VIER Cognitive Voice Gateway sous Profils de service de langue >Jeton de profil.",
        },
        inputProfileTokenFallbackLabel: {
            'default': "Profile Token Fallback",
            'deDE': "Profiltoken-Fallback",
            'esES': "Jeton de profil en tant que texte de secours",
        },
        inputProfileTokenLabel: {
            'default': "Profile Token",
            'deDE': "Profiltoken",
            'esES': "Jeton de profil",
        },
        inputServiceFallbackLabel: {
            'default': "Speech-to-Text Service Fallback",
            'deDE': "Fallback für Speech-to-Text-Dienst",
            'esES': "Texte de secours pour le service de transcription de la parole",
        },
        inputServiceLabel: {
            'default': "Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst",
            'esES': "Service de transcription de la parole",
        },
        inputTranscriberDescription: {
            'default': "Type in one of the follow Speech-to-Text Services: 'GOOGLE', 'IBM', 'MICROSOFT' or leave empty to set a service via profile token.",
            'deDE': "Geben Sie einen der folgenden Speech-to-Text-Dienste ein: 'GOOGLE', 'IBM', 'MICROSOFT' oder lassen Sie das Feld leer, um über das Profiltoken einen Dienst festzulegen.",
            'esES': "Saisir l’un des services de transcription de la parole : « GOOGLE », « IBM », « MICROSOFT » ou laisser le champ vide pour définir un service via le jeton de profil.",
        },
        nodeLabel: {
            'default': "Set Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst festlegen",
            'esES': "Définir le service de transcription de la parole",
        },
        nodeSummary: {
            'default': "Speech-to-Text services need to be used to transcribe the expected input in the best possible way",
            'deDE': "Speech-to-Text-Dienste müssen verwendet werden, um die erwartete Eingabe bestmöglich zu transkribieren",
            'esES': "Les services de transcription de la parole doivent être utilisés pour transcrire la saisie attendue du mieux possible",
        },
        sectionFallback: {
            'default': "Fallback Option",
            'deDE': "Fallback-Option",
            'esES': "Option de texte de secours",
        },
        sectionSelectLanguageLabel: {
            'default': "Select Language",
            'deDE': "Sprache wählen",
            'esES': "Sélectionner la langue",
        },
        sectionSelectSTTLabel: {
            'default': "Select Speech-to-Text Service",
            'deDE': "Speech-to-Text-Dienst wählen",
            'esES': "Sélectionner le service de transcription de la parole",
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
        enableTimerDescription: {
            'default': "To activate the Inactivity Timeout, activate this switch.",
            'deDE': "Um die Zeitüberschreitung bei Inaktivität zu aktivieren, aktivieren Sie diesen Schalter.",
            'esES': "Pour activer Temporisation en cas d'inactivité, activez ce switch.",
        },
        enableTimerLabel: {
            'default': "Enable or disable the inactivity timer",
            'deDE': "Inaktivitätstimer aktivieren oder deaktivieren",
            'esES': "Activer ou désactiver la minuterie d'inactivité",
        },
        inputTimeoutStartDescription: {
            'default': "You can set the Inactivity Timeout only if it is not already set in the VIER Cognitive Voice Gateway project settings.",
            'deDE': "Sie können die Inaktivitätszeitüberschreitung nur einstellen, wenn sie noch nicht in den Projekteinstellungen von VIER Cognitive Voice Gateway festgelegt wurde.",
            'esES': "Vous ne pouvez régler la temporisation en cas d'inactivité que lorsqu'elle n'a pas été définie dans les réglages du projet par VIER Cognitive Voice Gateway.",
        },
        inputTimeoutStopDescription: {
            'default': "Stops the Inactivity Timeout detection",
            'deDE': "Stoppt die Zeitüberschreitungs-Erkennung bei Inaktivität",
            'esES': "Arrête la détection de la temporisation en cas d'inactivité",
        },
        nodeLabel: {
            'default': "Inactivity Timeout",
            'deDE': "Zeitüberschreitung bei Inaktivität",
            'esES': "Temporisation en cas d'inactivité",
        },
        nodeSummary: {
            'default': "Sets the Inactivity Timeout in seconds",
            'deDE': "Legt die Zeitüberschreitung bei Inaktivität in Sekunden fest",
            'esES': "Définit la temporisation en cas d'inactivité en secondes",
        },
        useStartInputsLabel: {
            'default': "Activate Inactivity Timeout (in s)",
            'deDE': "Zeitüberschreitung bei Inaktivität (in s) aktivieren",
            'esES': "Activer la temporisation en cas d'inactivité (en s)",
        },
    },
};