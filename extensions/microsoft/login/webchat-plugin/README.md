# Cognigy Webchat Dialog Example Plugin
This repository contains a dialog example plugin for the [Cognigy Webchat](https://github.com/Cognigy/WebchatWidget).
It is meant to be used as a starting point when building a dialog-like plugin for the Cognigy Webchat.
The Dialog is styled based on the Webchat's `theme` for seamless integration.

## Installation

1. Clone this repo
2. Install all necessary dependencies via `npm i`
3. Run `npm run build` - this will create a `dist/dialog-example.webchat-plugin.js` plugin file for you
4. Use that file in your Cognigy Webchat as described in the [Cognigy Docs](https://docs.cognigy.com/docs/using-additional-webchat-plugins).

## Calling the Plugin from Cognigy
You can call the plugin from within Cognigy by sending a data message using a Say Node.

```
{
  "_plugin": {
    "type": "dialog",
  }
}
```

The message will render a button that is used to open the dialog.
When the button is clicked, the message will be switched over to fullscreen mode.
Within fullscreen mode, the message will render different markup that displays a top bar, a content area and a footer with cancel and submit buttons.
Upon clicking one of the buttons in the footer, the dialog will close.
