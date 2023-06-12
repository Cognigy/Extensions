import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetStopInfoParams extends INodeFunctionBaseParams {
    config: {
        stopId: string;
        infoType: string;
        results: number;
        duration: number;
        language: string;
        suburban: string;
        subway: string;
        tram: string;
        bus: string;
        ferry: string;
        express: string;
        regional: string;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}
export const getStopInfoNode = createNodeDescriptor({
    type: "getStopInfo",
    defaultLabel: {
        default: "Get Station Info",
        deDE: "Erhalte Haltestellen Infos"
    },
    summary: {
        default: "Returns the departure or arrival information",
        deDE: "Gibt die Abfahrten und Ankünfte zurück"
    },
    fields: [
        {
            key: "stopId",
            label: {
                default: "Stop ID",
                deDE: "Haltestellen ID"
            },
            type: "cognigyText",
            defaultValue: "{{input.bvg.stops[0].id}}",
            params: {
                required: true
            }
        },
        {
            key: "infoType",
            label: {
                default: "Info Type",
                deDE: "Info Typ"
            },
            type: "select",
            defaultValue: "departure",
            params: {
                options: [
                    {
                        label: {
                            default: "Departure",
                            deDE: "Abfahrten"
                        },
                        value: "departure"
                    },
                    {
                        label: {
                            default: "Arrivals",
                            deDE: "Ankünfte"
                        },
                        value: "arrivals"
                    }
                ]
            }
        },
        {
            key: "results",
            label: {
                default: "Number Results",
                deDE: "Anzahl Ergebnisse"
            },
            type: "number",
            defaultValue: 10,
            description: {
                default: "How many arrivals or departures should be shown",
                deDE: "Wieviele Anfahren oder Ankünfte gezeigt werden sollen"
            },
        },
        {
            key: "duration",
            label: {
                default: "Duration",
                deDE: "Anzahl Minuten"
            },
            type: "number",
            defaultValue: 10,
            description: {
                default: "Show arrivals or departures for how many minutes",
                deDE: "Für wieviele Minuten die Abfahren oder Ankünfte angezeigt werden sollen"
            },
        },
        {
            key: "language",
            label: {
                default: "Language",
                deDE: "Sprache"
            },
            type: "select",
            defaultValue: "de",
            params: {
				options: [
					{
						label: {
							default: "German",
							deDE: "Deutsch"
						},
						value: "de"
					},
					{
						label: {
							default: "English",
							deDE: "Englisch"
						},
						value: "en"
					}
				]
			}
        },
        {
            key: "suburban",
            label: {
                default: "Suburban",
                deDE: "S-Bahn"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "subway",
            label: {
                default: "Subway",
                deDE: "U-Bahn"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "tram",
            label: {
                default: "Tram",
                deDE: "Tram"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "bus",
            label: {
                default: "Bus",
                deDE: "Bus"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "ferry",
            label: {
                default: "Ferry",
                deDE: "Fähre"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "express",
            label: {
                default: "Express",
                deDE: "IC/ICE"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "regional",
            label: {
                default: "Regional",
                deDE: "RB/RE"
            },
            type: "toggle",
            defaultValue: true,
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "bvg.stop",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "bvg.stop",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "transportTypes",
            label: {
                default: "Transport Types",
                deDE: "Transportarten"
            },
            defaultCollapsed: true,
            fields: [
                "suburban",
                "subway",
                "tram",
                "bus",
                "ferry",
                "express",
                "regional"
            ]
        },
        {
            key: "advanced",
            label: {
                default: "Advanced",
                deDE: "Erweitert"
            },
            defaultCollapsed: true,
            fields: [
                "language",
                "results",
                "duration"
            ]
        },
        {
            key: "storageOption",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption"
            },
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "infoType" },
        { type: "field", key: "stopId" },
        { type: "section", key: "transportTypes" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: '#f0d722'
    },
    function: async ({ cognigy, config }: IGetStopInfoParams) => {
        const { api } = cognigy;
        const { stopId, infoType, results, duration, language, suburban, subway, ferry, express, bus, tram, regional, storeLocation, inputKey, contextKey } = config;

        try {

            let response;

            switch (infoType) {
                case "departure":
                    response = await axios({
                        method: 'get',
                        url: `https://v6.bvg.transport.rest/stops/${stopId}/departures`,
                        headers: {
                            'accept': 'application/json'
                        },
                        params: {
                            results,
                            duration,
                            language,
                            suburban,
                            subway,
                            ferry,
                            express,
                            bus,
                            tram,
                            regional
                        }
                    });
                    break;
                case "arrivals":
                    response = await axios({
                        method: 'get',
                        url: `https://v6.bvg.transport.rest/stops/${stopId}/arrivals`,
                        headers: {
                            'accept': 'application/json'
                        },
                        params: {
                            results,
                            duration,
                            language,
                            suburban,
                            subway,
                            ferry,
                            express,
                            bus,
                            tram,
                            regional
                        }
                    });
                    break;
                default:
            }

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
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
});