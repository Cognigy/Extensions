import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetAllWeatherAdvancedParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        city: string;
        inputKey: string;
    };
}
export const getWeatherAdvancedNode = createNodeDescriptor({
    type: "getWeatherAdvanced",
    defaultLabel: "Get Weather Advanced",
    preview: {
        key: "city",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "The api-key which should be used.",
            type: "connection",
            params: {
                connectionType: "api-key",
                required: true
            }
        },
        {
            key: "city",
            label: "city",
            type: "cognigyText",
            defaultValue: "Berlin",
            params: {
                required: true
            },
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "weather"
        }
    ],
    appearance: {
        color: "#fcb603"
    },
    dependencies: {
        children: ["onSuccess", "onError"]
    },
    function: async ({ cognigy, config, childConfigs }: IGetAllWeatherAdvancedParams) => {
        const { api } = cognigy;
        const { connection, city, inputKey } = config;
        const { key } = connection;

        try {

            const response = await axios({
                method: 'get',
                url: `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(city)}&appid=${key}`
            });

            const weather = response.data.main;

            const onSuccessChild = childConfigs.find(child => child.type === "onSuccess");

            if (!onSuccessChild) {
                throw new Error("Unable to find 'onSuccessChild'. Seems its not attached.");
            }

            // @ts-ignore
            api.addToInput(inputKey, weather);

            api.setNextNode(onSuccessChild.id);
            return;


        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onError");

            if (!onErrorChild) {
                throw new Error("Unable to find 'onErrorChild'. Seems its not attached.");
            }

            // @ts-ignore
            api.addToInput(inputKey, error);

            api.setNextNode(onErrorChild.id);

            return;
        }
    }
});

export const onSuccess = createNodeDescriptor({
    type: "onSuccess",

    parentType: "getWeatherAdvanced",
    defaultLabel: "On Success",
    appearance: {
        color: '#2ecc71',
        textColor: 'black',
        variant: 'mini'
    },

    constraints: {
        editable: false,
        deletable: true,
        collapsable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    }
});

export const onError = createNodeDescriptor({
    type: "onError",

    parentType: "getWeatherAdvanced",

    defaultLabel: "On Error",

    appearance: {
        color: '#9b59b6',
        textColor: 'black',
        variant: 'mini'
    },

    constraints: {
        editable: false,
        deletable: true,
        collapsable: true,
        creatable: true,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    }
});