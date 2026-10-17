import {
  createNodeDescriptor,
  INodeFunctionBaseParams,
} from "@cognigy/extension-tools";
import {
  getGoogleMapsLocation,
  getGoogleMapsLocationFromGeocodes,
} from "../helper/getGoogleMapsLocation";
import { getStation } from "../helper/getBikeStation";

export interface IGetLocationFromText extends INodeFunctionBaseParams {
  config: {
    connection: {
      key: string;
    };
    zoom: number;
    long: number;
    lat: number;
    searchchoice: string;
    place: string;
    city: string;
    country: string;
    storeType: string;
    contextKey: string;
    inputKey: string;
    storeLocation: string;
    inputStore: string;
  };
}
export const getStationFromText = createNodeDescriptor({
  type: "getStationFromText",
  defaultLabel: "Search Station",
  fields: [
    {
      key: "connection",
      label: "API Key",
      type: "connection",
      params: {
        connectionType: "api-key",
        required: true,
      },
    },
    {
      key: "searchchoice",
      type: "select",
      label: "Location Type",
      defaultValue: "address",
      params: {
        options: [
          {
            label: "Address",
            value: "address",
          },
          {
            label: "Coordinates",
            value: "coordinates",
          },
        ],
      },
    },
    {
      key: "lat",
      label: "Latitude",
      type: "cognigyText",
      condition: {
        key: "searchchoice",
        value: "coordinates",
      },
      params: {
        required: true,
      },
    },
    {
      key: "long",
      label: "Longitude",
      type: "cognigyText",
      condition: {
        key: "searchchoice",
        value: "coordinates",
      },
      params: {
        required: true,
      },
    },
    {
      key: "place",
      label: "Place",
      type: "cognigyText",
      defaultValue: "",
      params: {
        required: true,
      },
      condition: {
        key: "searchchoice",
        value: "address",
      },
    },
    {
      key: "city",
      label: "City",
      type: "cognigyText",
      params: {
        required: true,
      },
      condition: {
        key: "searchchoice",
        value: "address",
      },
    },
    {
      key: "country",
      label: "Country",
      type: "cognigyText",
      params: {
        required: true,
      },
      condition: {
        key: "searchchoice",
        value: "address",
      },
    },
    {
      key: "zoom",
      label: "Map Zoom",
      type: "cognigyText",
      defaultValue: "12",
      params: {
        required: false,
      },
    },
    {
      key: "storeLocation",
      type: "select",
      label: "Where to store the result",
      params: {
        options: [
          {
            label: "Input",
            value: "input",
          },
          {
            label: "Context",
            value: "context",
          },
        ],
        required: true,
      },
      defaultValue: "input",
    },
    {
      key: "inputKey",
      type: "cognigyText",
      label: "Input Key to store Result",
      defaultValue: "station",
      condition: {
        key: "storeLocation",
        value: "input",
      },
    },
    {
      key: "contextKey",
      type: "cognigyText",
      label: "Context Key to store Result",
      defaultValue: "station",
      condition: {
        key: "storeLocation",
        value: "context",
      },
    },
  ],
  sections: [
    {
      key: "map",
      label: "Map",
      defaultCollapsed: true,
      fields: ["zoom"],
    },
    {
      key: "storageOption",
      label: "Storage Option",
      defaultCollapsed: true,
      fields: ["storeLocation", "inputKey", "contextKey"],
    },
  ],
  form: [
    { type: "field", key: "connection" },
    { type: "field", key: "searchchoice" },
    { type: "field", key: "lat" },
    { type: "field", key: "long" },
    { type: "field", key: "place" },
    { type: "field", key: "city" },
    { type: "field", key: "country" },
    { type: "section", key: "map" },
    { type: "section", key: "storageOption" },
  ],
  appearance: {
    color: "#1e9c6d",
  },

  function: async ({ cognigy, config }: IGetLocationFromText) => {
    const { api } = cognigy;
    const {
      connection,
      searchchoice,
      lat,
      long,
      place,
      city,
      country,
      storeLocation,
      contextKey,
      inputKey,
      zoom,
    } = config;

    let station;

    if (searchchoice === "address") {
      let userAddress: string;
      let latitude: number;
      let longitude: number;

      if (!place || !city || !country || !connection) {
        throw new Error(
          "The request is missing the 'place', 'city' or 'country' value"
        );
      } else {
        try {
          let address = `${place}, ${city}, ${country}`;

          const response = await getGoogleMapsLocation(connection.key, address);

          userAddress = response.location.formatted_address;
          latitude = response.location.geometry.location.lat;
          longitude = response.location.geometry.location.lng;

          station = await getStation(latitude, longitude);

          if (storeLocation === "context") {
            api.addToContext(
              contextKey,
              {
                userCoordinates: {
                  latitude: latitude,
                  longitude: longitude
                },
                userAddress: userAddress,
                nerarestStation: station,
              },
              "simple"
            );
          } else {
            // @ts-ignore
            api.addToInput(inputKey, {
              userCoordinates: {
                latitude: latitude,
                longitude: longitude
              },
              address: userAddress,
              nerarestStation: station,
            });
          }
        } catch (error) {
          if (storeLocation === "context") {
            api.addToContext(contextKey, error, "simple");
          } else {
            // @ts-ignore
            api.addToInput(inputKey, error);
          }
        }
      }
    } else if (searchchoice === "coordinates") {
      try {
        const response = await getGoogleMapsLocationFromGeocodes(
          connection.key,
          `${lat},${long}`
        );

        station = await getStation(lat, long);

        if (storeLocation === "context") {
          api.addToContext(
            contextKey,
            {
              userAddress: response.location.formatted_address,
              userCoordinates: {
                latitude: lat,
                longitude: long,
              },
              nerarestStation: station,
            },
            "simple"
          );
        } else {
          // @ts-ignore
          api.addToInput(inputKey, {
            userAddress: response.location.formatted_address,
            userCoordinates: {
              latitude: lat,
              longitude: long,
            },
            nerarestStation: station,
          });
        }
      } catch (error) {
        if (storeLocation === "context") {
          api.addToContext(contextKey, error, "simple");
        } else {
          // @ts-ignore
          api.addToInput(inputKey, error);
        }
      }
    }
    api.output("", {
      _plugin: {
        type: "google-maps",
        center: {
          lat: Number(station.latitude),
          lng: Number(station.longitude),
        },
        zoom: Number(zoom) || 12,
        apikey: connection.key,
      },
    });
  },
});
