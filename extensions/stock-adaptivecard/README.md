# Stock Quote Adaptive Card

Requests stock quote and other parameters from [IEX Quote API](https://iexcloud.io/docs/api/#quote), then sends a data-only message to the web chat. The web chat renders this message using [Adaptive Cards Webchat Plugin](https://github.com/Cognigy/WebchatPlugins/tree/master/plugins/adaptivecards). If the plugin is not loaded, the web chat will not show anything.

This extension contains one node: Show Stock Card. It has the following properties:
- `IEX Connection` - a connection with a token, which is required to get authorozed by IEX API. You can get a fee token after you register and log in [IEX Cloud Console](https://iexcloud.io/console/tokens). There are two API tokens in the console: secret and publishable. You need to get your publushable token.
- `Stock Symbol` - a symbol or ticker that identifies the stock. Must be one of the symbols [supported by IEX Cloud](https://iextrading.com/trading/eligible-symbols/).

Here is an example setup:

![Example Setup](./docs/stock-adaptive-card-screenshot.png)