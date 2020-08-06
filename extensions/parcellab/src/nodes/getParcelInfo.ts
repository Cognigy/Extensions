import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
export interface IgetParcelInfo extends INodeFunctionBaseParams {
    config: {
      connection: {
              user: any;
          };
orderNumber: any;
language: any;
contextStore: any;
stopOnError: any;

  }
}

export const getParcelInfo = createNodeDescriptor({
  type: "getParcelInfo",
  fields: [
{
    key: "connection",
    label: "The configured connection to use",
    type: "connection",
    params: {
        connectionType: "apikey",
    }
},{
  key: "orderNumber",
  label: "The file id for a bot",
  type: "cognigyText",
},{
  key: "language",
  label: "The ids of the devices where you want to deploy the bot",
  type: "select",
  params: {
    options: [{label:" de",value:" de"},{label:"en",value:"en"},]
  }
},{
  key: "contextStore",
  label: "Where to store the result",
  type: "cognigyText",
},{
  key: "stopOnError",
  label: "Whether to stop on error or continue",
  type: "toggle",
},
  ],
  function: async ({ cognigy, config }: IgetParcelInfo) => {
    const { api } = cognigy;
    const { connection, orderNumber, language, contextStore, stopOnError,  } = config;
    const { user } = connection;
  try {

    const response = await axios({
      method: 'get',
      url: `https://api.parcellab.com/v2/checkpoints/?user=${user}&orderNo=${orderNumber}&lang=${language}`,
    });

    api.addToContext(contextStore, response.data, 'simple');
  } catch (error) {
    if (stopOnError) {
      throw new Error(error.message);
    } else {
      api.addToContext(contextStore, { error: error.message}, 'simple');
    }
  }

}
});