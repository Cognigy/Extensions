# AWS Polly Extension

**Connection:**
You have to create a user in [IAM](https://console.aws.amazon.com/iam) which has the roles for accessing the [AWS Polly](https://aws.amazon.com/de/polly/) ([Documentation](https://docs.aws.amazon.com/polly/index.html))services.
- AWS Region
    - key: region
    - value: The AWS Region of your Instance
- AWS Access Key
    - key: accessKeyId
    - value: Your AWS Access Key
- AWS Secret Access Key
    - key: secretAccessKey
    - value: Your AWS secret key

## Node: SayPolly

As soon as the node gets executed, it will return the following response: 
```json
{
    "read":true,
    "url":"https://polly.eu-central-1.amazonaws.com/v1/speech?OutputFormat=mp3&SampleRate=8000&Text=HalloWelt&TextType=text&VoiceId=Marlene&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...%2Feu-central-1%2Fpolly%2Faws4_request&X-Amz-Date=20200123T084453Z&X-Amz-Expires=3600&X-Amz-Signature=...&X-Amz-SignedHeaders=host"
}
```
The returned `url` stores the mp3 file, which contains the spoken message. In this case, the voice `Marlene` outputs the text: `HelloWelt`.

### Use it in your webchat:

You can simply use the webchat's [Analytics API](https://github.com/Cognigy/WebchatWidget/blob/feature/6640-improve-webchat-documentation/docs/analytics-api.md) to handle incoming user messages. If the current message has no text but the following data object, polly will read out loud the sent text:
```javascript
{
    "read" true,
    "url": "<url to polly mp3 file>"
}
```
To test this, you can use the following HTML file:
```html
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- <link rel="manifest" href="/manifest.webmanifest"> -->
</head>
<body>
    <audio id="polly">
        <source src="" type="audio/mpeg">
    </audio>
    <!-- <script src="./persistent-menu.webchat-plugin.js"></script> -->
    <script src="https://github.com/Cognigy/WebchatWidget/releases/download/v2.10.1/webchat.js"></script>
    <script>
        initWebchat('<webchat-config-url>', {
            settings: {
                // colorScheme: '#FAB'
            }
        }).then(webchat => {
            window.cognigyWebchat = webchat;
            // webchat.open();

            // source: https://github.com/Cognigy/WebchatWidget/releases?after=v2.7.0
            webchat.registerAnalyticsService(event => {
                const { type, payload } = event;
                switch (type) {
                    // CB When a user sends a message to the chatbot (either by clicking the “Send” button or by hitting Enter on the keyboard)
                    case 'webchat/incoming-message': {
                        const { text, data } = payload;

                        try {
                            const { read } = data;
                            if (data.read) {
                                const url = data.url;

                                let audio = document.getElementById('polly')
                                audio.src = url

                                audio.play()
                            }
                        } catch (error) { }

                        break;
                    }
                }
            })
        });
    </script>
</body>
</html>
```