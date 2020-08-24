# AWS SDK Calls

This extension facilitates calls to a number of relevant AWS APIs. Now you can call the AWS SDK from Cognigy, without a single line of code.

**Connection:**
For most AWS API calls, you must supply [AWS credentials](https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html) as [access keys](https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html) which have the required permissions to access the service you are calling, as well at the AWS [Region](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/#Regions).
You will need to supply:
- AWS Region
    - key: region
    - value: The AWS Region of your Instance
- AWS Access Key
    - key: accessKeyId
    - value: Your AWS Access Key
- AWS Secret Access Key
    - key: secretAccessKey
    - value: Your AWS secret key

Good practice is to create a user in [IAM](https://console.aws.amazon.com/iam) which has only the minimal permissions needed for the Project/Flow. See the Lamda Invoke Node for an example of such minimal permissions.

----
## Node: Lambda Invoke
AWS [Lambda Functions](https://aws.amazon.com/lambda) are serverless, infinitely scalable 'run-time as a service' code functions.

This Node invoke a Lambda function, supplying input data as a JSON object, and receiving return results and output data as a JSON object.

### IAM Setup
To setup an IAM [IAM](https://console.aws.amazon.com/iam) user with just enough permissions to call your Lambda function, give the user the permissions (in JSON) as shown below.
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "lambda:InvokeFunction",
            "Resource": "arn:aws:lambda:<your Region>:<your AccountId>:function:<your Function Name"
        }
    ]
}
```
The Resource details required above can easily be found while viewing the Lambda function from the AWS console - The 'ARN' is the value required for 'Resource'.

----
## Node: S3 Put Object
[S3](https://aws.amazon.com/s3) is the original cloud object(file) storage service from AWS.

This Node 'Puts' (writes) a file into an S3 '[bucket](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingBucket.html)'.

To write **text data** into the file (object), set the `Data Format` to `Text`.

To write **binary data** (such as an image), first encode as a `base64` string, supply this string for `Data to Put` and set `Data Format` to `base64`. This will result in a binary file, containing any binary data values required for any file type.

**Hint:** S3 paths are really just string indexes to the object. You must always supply the exact same full path, but note that normal S3 convention is to **NOT** start with a "/", instead just like "someTopFolder/someSubFolder/someFile.txt" for example. This Node will write a warning into the project logging if such a path is used, but will still write the object as requested.

### IAM Setup
Example of IAM user permissions to read/write S3 files. Note that we grant both Put and Get actions, and you can specify a path (prefix) to limit where can be read/written:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::<your Bucket Name>/<some Path>/*"
            ]
        }
    ]
}
```

## Node: S3 Get Object
This Node 'Gets' (reads) a file from an S3 '[bucket](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingBucket.html)'.

The options are similar to [S3 Put Object](#Node-S3-Put-Object).

----
## Node: SayPolly

Uses [AWS Polly](https://aws.amazon.com/polly/) to turn text into audio speech, via the AWS [Polly serice](https://docs.aws.amazon.com/polly/index.html).

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