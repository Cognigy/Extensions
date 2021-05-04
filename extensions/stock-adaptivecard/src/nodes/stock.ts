import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IStockCardParams extends INodeFunctionBaseParams {
  config: {
    connection: { token: string };
    symbol: string
  };
}

export const stockNode = createNodeDescriptor({
  type: "stockCard",
  defaultLabel: "Show Stock Card",
  fields: [
    {
      key: "connection",
      type: "connection",
      label: "IEX Connection",
      description: "Connection that holds the token, which is required to get authenticated by IEX API",
      params: { connectionType: "iex", required: true }
    },
    {
      key: "symbol",
      type: "cognigyText",
      label: "Stock Symbol",
      description: "Symbol or ticker for which the information card is shown",
      defaultValue: "AAPL",
      params: { required: true }
    }
  ],
  function: async ({ cognigy, config }: IStockCardParams) => {
    const { api } = cognigy;
    const { connection, symbol } = config;
    const { token } = connection;
    const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${token}`;

    try {
      const response = await axios.get(url);
      const stock = response.data;
      const cardPayload = {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.2",
        "body": [
          {
            "type": "TextBlock",
            "text": stock.companyName,
            "size": "medium",
            "wrap": true
          },
          {
            "type": "TextBlock",
            "text": `${stock.primaryExchange}: ${stock.symbol}`,
            "isSubtle": true,
            "size": "small",
            "spacing": "none",
            "wrap": true
          },
          {
            "type": "RichTextBlock",
            "inlines": [
              {
                "type": "TextRun",
                "text": stock.latestPrice.toFixed(2),
                "weight": "Bolder",
                "size": "ExtraLarge"
              },
              {
                "type": "TextRun",
                "text": " USD ",
                "weight": "Lighter",
                "size": "Large",
                "subtle": true
              },
              {
                "type": "TextRun",
                "text": ` ${stock.change >= 0 ? '▲' : '▼'}${stock.change} (${stock.changePercent.toFixed(3)}%)`,
                "color": `${stock.change >= 0 ? 'good' : 'attention'}`
              }
            ]
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "Market Cap",
                "value": `${abbreviateNumber(stock.marketCap)}`,
                "spacing": "none",
                "size": "small"
              },
              {
                "title": "52-week high",
                "value": `${stock.week52High.toFixed(2)}`,
                "spacing": "none",
                "size": "small"
              },
              {
                "title": "52-week low",
                "value": `${stock.week52Low.toFixed(2)}`,
                "spacing": "none",
                "size": "small"
              }
            ]
          },
          {
            "type": "TextBlock",
            "text": `Latest update: ${new Date(stock.latestUpdate).toLocaleString()}, source: IEX Cloud API`,
            "size": "small",
            "isSubtle": true,
            "wrap": true
          }
        ]
      };

      api.say('', { "_plugin": { "type": "adaptivecards", "payload": cardPayload } });
    } catch (error) {
      api.log('error', error);
    }
  }
});

function abbreviateNumber(n: number): any {
  const tier = Math.log10(Math.abs(n)) / 3 | 0;
  if (tier === 0) {
    return n;
  }
  const SUFFIXES = ['', 'k', 'M', 'B', 'T', 'P', 'E'];
  const suffix = SUFFIXES[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = n / scale;
  return scaled.toFixed(1) + suffix;
}
