# Google Cloud

With this Extension you can use the [Google Cloud API](https://console.cloud.google.com/) to translate or recognize text inside your Cognigy bot

**Connection**

To use the Google Cloud you need to enable a specific `API_KEY` in your Google Cloud Console. After getting your `API_KEY` you have to define your Cognigy Secret as the following: 

- Secret Key: **key**
- Secret Value: **API_KEY**

**Translation, LanguageDetection**

| [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com) | API_KEY |
| ------------------------------------------------------------ | ------- |
|                                                              |         |

## Node: TranslateText

This node translates a given text into a specific given language. Just choose a **language** in which the **text** should be translated. If you want to use this translation in your later bot conversation, just store it to the CognigyContext.

Example sentence: *Soy Alex y trabajo a Cognigy en Düsseldorf.*

```json
"translation": "私はAlexです。私はデュッセルドルフのCognigyで働いています。",
```



## Node: DetectLanguageInText

This node detects the language of your given **text** and stores it to the CognigyContext if you want:

Example sentence: *Soy Alex y trabajo a Cognigy en Düsseldorf.*

```json
"language": "es"
```