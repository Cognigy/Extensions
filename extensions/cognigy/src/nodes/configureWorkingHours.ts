
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as momenttimezone from "moment-timezone";
import * as moment from "moment";

export interface IConfigureWorkingHoursParams extends INodeFunctionBaseParams {
    config: {
        timezone: string;
        mondayStart: string;
        mondayEnd: string;
        tuesdayStart: string;
        tuesdayEnd: string;
        wednesdayStart: string;
        wednesdayEnd: string;
        thursdayStart: string;
        thursdayEnd: string;
        fridayStart: string;
        fridayEnd: string;
        saturdayStart: string;
        saturdayEnd: string;
        sundayStart: string;
        sundayEnd: string;
        mondayEnabled: boolean;
        tuesdayEnabled: boolean;
        wednesdayEnabled: boolean;
        thursdayEnabled: boolean;
        fridayEnabled: boolean;
        saturdayEnabled: boolean;
        sundayEnabled: boolean;
        mondayBreakEnabled: boolean;
        tuesdayBreakEnabled: boolean;
        wednesdayBreakEnabled: boolean;
        thursdayBreakEnabled: boolean;
        fridayBreakEnabled: boolean;
        saturdayBreakEnabled: boolean;
        sundayBreakEnabled: boolean;
        mondayBreakStart: string;
        mondayBreakEnd: string;
        tuesdayBreakStart: string;
        tuesdayBreakEnd: string;
        wednesdayBreakStart: string;
        wednesdayBreakEnd: string;
        thursdayBreakStart: string;
        thursdayBreakEnd: string;
        fridayBreakStart: string;
        fridayBreakEnd: string;
        saturdayBreakStart: string;
        saturdayBreakEnd: string;
        sundayBreakStart: string;
        sundayBreakEnd: string;
        storeWorkingHoursInContext: boolean;
        enableClosedDates: boolean;
        closedDates: string[];
    };
}

export const configureWorkingHoursNode = createNodeDescriptor({
    type: "configureWorkingHours",
    defaultLabel: {
        deDE: "Öffnungszeiten",
        default: "Set Working Hours"
    },
    fields: [
        {
            key: "timezone",
            type: "select",
            label: {
                deDE: "Zeitzone",
                default: "Timezone"
            },
            description: "The timezone in which the working hours are configured",
            defaultValue: "Europe/Berlin",
            params: {
                options: [
                    {
                        label: "Honolulu, Pacific",
                        value: "Pacific/Honolulu"
                    },
                    {
                        label: "Anchorage, America",
                        value: "America/Anchorage"
                    },
                    {
                        label: "Los Angeles, America (PST)",
                        value: "America/Los_Angeles"
                    },
                    {
                        label: "Phoenix, America",
                        value: "America/Phoenix"
                    },
                    {
                        label: "Chicago, America",
                        value: "America/Chicago"
                    },
                    {
                        label: "La Paz, America",
                        value: "America/La_Paz"
                    },
                    {
                        label: "New York, America (EST)",
                        value: "America/New_York"
                    },
                    {
                        label: "Sao Paulo, America",
                        value: "America/Sao_Paulo"
                    },
                    {
                        label: "Cape Verde, Atlantic",
                        value: "Atlantic/Cape_Verde"
                    },
                    {
                        label: "Casablanca, Africa",
                        value: "Africa/Casablanca"
                    },
                    {
                        label: "Berlin, Europe",
                        value: "Europe/Berlin"
                    },
                    {
                        label: "London, Europe",
                        value: "Europe/London"
                    },
                    {
                        label: "Kiev, Europe",
                        value: "Europe/Kiev"
                    },
                    {
                        label: "Riyadh, Asia",
                        value: "Asia/Riyadh"
                    },
                    {
                        label: "Dubai, Asia",
                        value: "Asia/Dubai"
                    },
                    {
                        label: "Tashkent, Asia",
                        value: "Asia/Tashkent"
                    },
                    {
                        label: "Dhaka, Asia",
                        value: "Asia/Dhaka"
                    },
                    {
                        label: "Bangkok, Asia",
                        value: "Asia/Bangkok"
                    },
                    {
                        label: "Singapore, Asia",
                        value: "Asia/Singapore"
                    },
                    {
                        label: "Tokyo, Asia",
                        value: "Asia/Tokyo"
                    },
                    {
                        label: "Vladivostok, Asia",
                        value: "Asia/Vladivostok"
                    },
                    {
                        label: "Sydney, Australia",
                        value: "Australia/Sydney"
                    },
                    {
                        label: "Auckland, Pacific",
                        value: "Pacific/Auckland"
                    },
                    {
                        label: "Apia, Pacific",
                        value: "Pacific/Apia"
                    }
                ]
            }
        },
        {
            key: "mondayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Montag",
                    default: "Monday"
                }
            }
        },
        {
            key: "mondayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "mondayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "9:00",
            params: {
                required: true,
                placeholder: "9:00"
            },
            condition: {
                key: "mondayEnabled",
                value: true
            }
        },
        {
            key: "mondayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "20:00",
            params: {
                required: true,
                placeholder: "20:00"
            },
            condition: {
                key: "mondayEnabled",
                value: true
            }
        },


        {
            key: "mondayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "mondayEnabled",
                value: true,
            }
        },
        {
            key: "mondayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "mondayEnabled",
                value: true,
            }
        },
        {
            key: "mondayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "mondayEnabled",
                        value: true,
                    },
                    {
                        key: "mondayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "mondayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "mondayEnabled",
                        value: true,
                    },
                    {
                        key: "mondayBreakEnabled",
                        value: true
                    }
                ]
            }
        },



        {
            key: "tuesdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Dienstag",
                    default: "Tuesday"
                }
            }
        },
        {
            key: "tuesdayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "tuesdayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "9:00",
            params: {
                required: true,
                placeholder: "9:00"
            },
            condition: {
                key: "tuesdayEnabled",
                value: true
            }
        },
        {
            key: "tuesdayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "18:00",
            params: {
                required: true,
                placeholder: "18:00"
            },
            condition: {
                key: "tuesdayEnabled",
                value: true
            }
        },


        {
            key: "tuesdayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "tuesdayEnabled",
                value: true,
            }
        },
        {
            key: "tuesdayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "tuesdayEnabled",
                value: true,
            }
        },
        {
            key: "tuesdayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "tuesdayEnabled",
                        value: true,
                    },
                    {
                        key: "tuesdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "tuesdayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "tuesdayEnabled",
                        value: true,
                    },
                    {
                        key: "tuesdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },



        {
            key: "wednesdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittwoch",
                    default: "Wednesday"
                }
            }
        },
        {
            key: "wednesdayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "wednesdayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "9:00",
            params: {
                required: true,
                placeholder: "9:00"
            },
            condition: {
                key: "wednesdayEnabled",
                value: true
            }
        },
        {
            key: "wednesdayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "17:30",
            params: {
                required: true,
                placeholder: "18:00"
            },
            condition: {
                key: "wednesdayEnabled",
                value: true
            }
        },


        {
            key: "wednesdayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "wednesdayEnabled",
                value: true,
            }
        },
        {
            key: "wednesdayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "wednesdayEnabled",
                value: true,
            }
        },
        {
            key: "wednesdayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "wednesdayEnabled",
                        value: true,
                    },
                    {
                        key: "wednesdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "wednesdayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "wednesdayEnabled",
                        value: true,
                    },
                    {
                        key: "wednesdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },



        {
            key: "thursdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Donnerstag",
                    default: "Thursday"
                }
            }
        },
        {
            key: "thursdayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "thursdayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "9:00",
            params: {
                required: true,
                placeholder: "9:00"
            },
            condition: {
                key: "thursdayEnabled",
                value: true
            }
        },
        {
            key: "thursdayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            defaultValue: "18:00",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            params: {
                required: true,
                placeholder: "18:00"
            },
            condition: {
                key: "thursdayEnabled",
                value: true
            }
        },


        {
            key: "thursdayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "thursdayEnabled",
                value: true,
            }
        },
        {
            key: "thursdayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "thursdayEnabled",
                value: true,
            }
        },
        {
            key: "thursdayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "thursdayEnabled",
                        value: true,
                    },
                    {
                        key: "thursdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "thursdayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "thursdayEnabled",
                        value: true,
                    },
                    {
                        key: "thursdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },


        {
            key: "fridayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Freitag",
                    default: "Friday"
                }
            }
        },
        {
            key: "fridayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "fridayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "9:00",
            params: {
                required: true,
                placeholder: "9:00"
            },
            condition: {
                key: "fridayEnabled",
                value: true
            }
        },
        {
            key: "fridayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            defaultValue: "18:00",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            params: {
                required: true,
                placeholder: "18:00"
            },
            condition: {
                key: "fridayEnabled",
                value: true
            }
        },


        {
            key: "fridayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "fridayEnabled",
                value: true,
            }
        },
        {
            key: "fridayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "fridayEnabled",
                value: true,
            }
        },
        {
            key: "fridayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "fridayEnabled",
                        value: true,
                    },
                    {
                        key: "fridayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "fridayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "fridayEnabled",
                        value: true,
                    },
                    {
                        key: "fridayBreakEnabled",
                        value: true
                    }
                ]
            }
        },



        {
            key: "saturdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Samstag",
                    default: "Saturday"
                }
            }
        },
        {
            key: "saturdayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: false,
            params: {
                required: true
            }
        },
        {
            key: "saturdayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "10:00",
            params: {
                required: true,
                placeholder: "10:00"
            },
            condition: {
                key: "saturdayEnabled",
                value: true
            }
        },
        {
            key: "saturdayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            defaultValue: "14:00",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            params: {
                required: true,
                placeholder: "14:00"
            },
            condition: {
                key: "saturdayEnabled",
                value: true
            }
        },


        {
            key: "saturdayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "saturdayEnabled",
                value: true,
            }
        },
        {
            key: "saturdayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "saturdayEnabled",
                value: true,
            }
        },
        {
            key: "saturdayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "saturdayEnabled",
                        value: true,
                    },
                    {
                        key: "saturdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "saturdayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "saturdayEnabled",
                        value: true,
                    },
                    {
                        key: "saturdayBreakEnabled",
                        value: true
                    }
                ]
            }
        },




        {
            key: "sundayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Sonntag",
                    default: "Sunday"
                }
            }
        },
        {
            key: "sundayEnabled",
            type: "toggle",
            label: {
                deDE: "Geöffnet",
                default: "Open"
            },
            defaultValue: false,
            params: {
                required: true
            }
        },
        {
            key: "sundayStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            type: "time",
            defaultValue: "10:00",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            params: {
                required: true,
                placeholder: "10:00"
            },
            condition: {
                key: "sundayEnabled",
                value: true
            }
        },
        {
            key: "sundayEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            defaultValue: "12:00",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                key: "sundayEnabled",
                value: true
            }
        },


        {
            key: "sundayBreakDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Mittagspause",
                    default: "Lunch Break"
                }
            },
            condition: {
                key: "sundayEnabled",
                value: true,
            }
        },
        {
            key: "sundayBreakEnabled",
            type: "toggle",
            label: {
                deDE: "Findet statt",
                default: "Plan"
            },
            defaultValue: true,
            params: {
                required: true
            },
            condition: {
                key: "sundayEnabled",
                value: true,
            }
        },
        {
            key: "sundayBreakStart",
            label: {
                deDE: "Von",
                default: "From"
            },
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            type: "time",
            defaultValue: "12:00",
            params: {
                required: true,
                placeholder: "12:00"
            },
            condition: {
                and: [
                    {
                        key: "sundayEnabled",
                        value: true,
                    },
                    {
                        key: "sundayBreakEnabled",
                        value: true
                    }
                ]
            }
        },
        {
            key: "sundayBreakEnd",
            label: {
                deDE: "Bis",
                default: "To"
            },
            type: "time",
            description: {
                deDE: "Die Stunde im 24-Stunden-Format: 7 Uhr morgens ist 7 und 19 Uhr abends ist 19",
                default: "The hour in 24 hours format where 7am is 7 and 7pm is 19"
            },
            defaultValue: "13:00",
            params: {
                required: true,
                placeholder: "13:00"
            },
            condition: {
                and: [
                    {
                        key: "sundayEnabled",
                        value: true,
                    },
                    {
                        key: "sundayBreakEnabled",
                        value: true
                    }
                ]
            }
        },


        {
            key: "storeWorkingHoursInContext",
            label: {
                deDE: "Zeiten im Kontext speichern",
                default: "Store Working Hours in Context"
            },
            type: "toggle",
            defaultValue: false,
        },
        {
            key: "enableClosedDates",
            type: "toggle",
            defaultValue: false,
            description: {
                deDE: "Ob es Tage gibt, an denen das Büro geschlossen ist oder nicht",
                default: "Whether there are dates when the office is closed or not"
            },
            label: {
                deDE: "Tag hinzufügen",
                default: "Add Closed Dates"
            },
        },
        {
            key: "closedDatesDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: {
                    deDE: "Geben Sie eine Liste von Daten an, an denen das Büro oder das Geschäft geschlossen ist. Bitte geben Sie nur ein Datum pro Zeile ein und verwenden Sie das Datumsformat TT.MM.JJJJ, z. B. 14.01.2024.",
                    default: "Provide a list of dates when the office or store is closed. Please insert one date per row only and use the dateformat DD.MM.YYYY, such as 14.01.2024."
                }
            },
            condition: {
                key: "enableClosedDates",
                value: true
            }
        },
        {
            key: "closedDates",
            label: {
                deDE: "Geschlossen am",
                default: "Closed Dates"
            },
            type: "textArray",
            defaultValue: false,
            condition: {
                key: "enableClosedDates",
                value: true
            }
        }
    ],
    form: [
        { type: "field", key: "timezone" },
        { type: "section", key: "mondayGeneralWorkingHours" },
        { type: "section", key: "tuesdayGeneralWorkingHours" },
        { type: "section", key: "wednesdayGeneralWorkingHours" },
        { type: "section", key: "thursdayGeneralWorkingHours" },
        { type: "section", key: "fridayGeneralWorkingHours" },
        { type: "section", key: "saturdayGeneralWorkingHours" },
        { type: "section", key: "sundayGeneralWorkingHours" },
        // { type: "section", key: "generalWorkingHours" },
        { type: "section", key: "closedDates" },
        { type: "section", key: "advanced" }
    ],
    sections: [
        {
            key: "mondayGeneralWorkingHours",
            label: {
                deDE: "Montag",
                default: "Monday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "mondayEnabled",
                "mondayStart",
                "mondayEnd",
                "mondayBreakDescription",
                "mondayBreakEnabled",
                "mondayBreakStart",
                "mondayBreakEnd"
            ]
        },
        {
            key: "tuesdayGeneralWorkingHours",
            label: {
                deDE: "Dienstag",
                default: "Tuesday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "tuesdayEnabled",
                "tuesdayStart",
                "tuesdayEnd",
                "tuesdayBreakDescription",
                "tuesdayBreakEnabled",
                "tuesdayBreakStart",
                "tuesdayBreakEnd"
            ]
        },
        {
            key: "wednesdayGeneralWorkingHours",
            label: {
                deDE: "Mittwoch",
                default: "Wednesday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "wednesdayEnabled",
                "wednesdayStart",
                "wednesdayEnd",
                "wednesdayBreakDescription",
                "wednesdayBreakEnabled",
                "wednesdayBreakStart",
                "wednesdayBreakEnd"
            ]
        },
        {
            key: "thursdayGeneralWorkingHours",
            label: {
                deDE: "Donnerstag",
                default: "Thursday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "thursdayEnabled",
                "thursdayStart",
                "thursdayEnd",
                "thursdayBreakDescription",
                "thursdayBreakEnabled",
                "thursdayBreakStart",
                "thursdayBreakEnd"
            ]
        },
        {
            key: "fridayGeneralWorkingHours",
            label: {
                deDE: "Freitag",
                default: "Friday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "fridayEnabled",
                "fridayStart",
                "fridayEnd",
                "fridayBreakDescription",
                "fridayBreakEnabled",
                "fridayBreakStart",
                "fridayBreakEnd"
            ]
        },
        {
            key: "saturdayGeneralWorkingHours",
            label: {
                deDE: "Samstag",
                default: "Saturday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "saturdayEnabled",
                "saturdayStart",
                "saturdayEnd",
                "saturdayBreakDescription",
                "saturdayBreakEnabled",
                "saturdayBreakStart",
                "saturdayBreakEnd"
            ]
        },
        {
            key: "sundayGeneralWorkingHours",
            label: {
                deDE: "Sonntag",
                default: "Sunday"
            },
            defaultCollapsed: true,
            fields: [
                // "mondayDescription",
                "sundayEnabled",
                "sundayStart",
                "sundayEnd",
                "sundayBreakDescription",
                "sundayBreakEnabled",
                "sundayBreakStart",
                "sundayBreakEnd"
            ]
        },
        {
            key: "generalWorkingHours",
            label: {
                deDE: "Öffnungszeiten",
                default: "Working Hours"
            },
            defaultCollapsed: true,
            fields: [
                "mondayDescription",
                "mondayEnabled",
                "mondayStart",
                "mondayEnd",
                "tuesdayDescription",
                "tuesdayEnabled",
                "tuesdayStart",
                "tuesdayEnd",
                "wednesdayDescription",
                "wednesdayEnabled",
                "wednesdayStart",
                "wednesdayEnd",
                "thursdayDescription",
                "thursdayEnabled",
                "thursdayStart",
                "thursdayEnd",
                "fridayDescription",
                "fridayEnabled",
                "fridayStart",
                "fridayEnd",
                "saturdayDescription",
                "saturdayEnabled",
                "saturdayStart",
                "saturdayEnd",
                "sundayDescription",
                "sundayEnabled",
                "sundayStart",
                "sundayEnd"
            ]
        },
        {
            key: "closedDates",
            label: {
                deDE: "Geschlossen am",
                default: "Closed Dates"
            },
            defaultCollapsed: true,
            fields: [
                "enableClosedDates",
                "closedDatesDescription",
                "closedDates"
            ]
        },
        {
            key: "advanced",
            label: {
                deDE: "Erweiterte Optionen",
                default: "Advanced"
            },
            defaultCollapsed: true,
            fields: [
                "storeWorkingHoursInContext"
            ]
        },
    ],
    tokens: [
        {
            label: "Handover is open",
            script: "context.handoverOpen",
            type: "context"
        }
    ],
    dependencies: {
        children: [
            "onOpen",
            "onClosed"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IConfigureWorkingHoursParams): Promise<any> => {
        const { api, input } = cognigy;
        const {
            timezone,
            mondayStart,
            mondayEnd,
            tuesdayStart,
            tuesdayEnd,
            wednesdayStart,
            wednesdayEnd,
            thursdayStart,
            thursdayEnd,
            fridayStart,
            fridayEnd,
            saturdayStart,
            saturdayEnd,
            sundayStart,
            sundayEnd,

            mondayEnabled,
            thursdayEnabled,
            wednesdayEnabled,
            tuesdayEnabled,
            fridayEnabled,
            saturdayEnabled,
            sundayEnabled,

            mondayBreakEnabled,
            mondayBreakStart,
            mondayBreakEnd,
            tuesdayBreakEnabled,
            tuesdayBreakStart,
            tuesdayBreakEnd,
            wednesdayBreakEnabled,
            wednesdayBreakStart,
            wednesdayBreakEnd,
            thursdayBreakEnabled,
            thursdayBreakStart,
            thursdayBreakEnd,
            fridayBreakEnabled,
            fridayBreakStart,
            fridayBreakEnd,
            saturdayBreakEnabled,
            saturdayBreakEnd,
            saturdayBreakStart,
            sundayBreakEnabled,
            sundayBreakStart,
            sundayBreakEnd,

            enableClosedDates,
            closedDates,
            storeWorkingHoursInContext,
        } = config;

        function isChristmasOrNewYearsDay(): boolean {
            const currentDateInTimezone = momenttimezone.utc(input.currentTime.ISODate).tz(timezone);
            const currentDayOfWeekInTimezone: number = currentDateInTimezone.weekday();
            const currentMonthInTimezone: number = currentDateInTimezone.month();

            if ((currentMonthInTimezone === 12 && currentDayOfWeekInTimezone === 25) || (currentMonthInTimezone === 1 && currentDayOfWeekInTimezone === 1)) {
                return true;
            } else {
                return false;
            }
        }

        let holidayTest = isChristmasOrNewYearsDay();
        if (holidayTest === true) {
            api.log('info', 'Time is in holiday period');
            api.addToContext('handoverOpen', false, 'simple');

            // check if date is in list of closed dates
        } else if (enableClosedDates && closedDates.includes(`${input.currentTime.day < 10 ? '0' + input.currentTime.day : input.currentTime.day}.${input.currentTime.month < 10 ? '0' + input.currentTime.month : input.currentTime.month}.${input.currentTime.year}`)) {
            api.log('info', 'Time is a closed date');
            api.addToContext('handoverOpen', false, 'simple');
        } else {

            api.log('info', 'Check if time is in working hours');

            function isInWorkingHours(): boolean {
                const currentDateInTimezone = momenttimezone.utc(input.currentTime.ISODate).tz(timezone);
                const currentDayOfWeekInTimezone: number = currentDateInTimezone.weekday();
                const currentHourInTimezone: number = currentDateInTimezone.hours();
                const currentMinutesInTimezone: number = currentDateInTimezone.minutes();

                switch (currentDayOfWeekInTimezone) {

                    // Monday
                    case 1:
                        if (mondayEnabled) {
                            if (mondayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(mondayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(mondayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(mondayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(mondayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Tuesday
                    case 2:
                        if (tuesdayEnabled) {
                            if (tuesdayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(tuesdayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(tuesdayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(tuesdayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(tuesdayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Wednesday
                    case 3:
                        if (wednesdayEnabled) {
                            if (wednesdayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(wednesdayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(wednesdayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(wednesdayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(wednesdayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Thursday
                    case 4:
                        if (thursdayEnabled) {
                            if (thursdayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(thursdayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(thursdayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(thursdayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(thursdayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Friday
                    case 5:
                        if (fridayEnabled) {
                            if (fridayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(fridayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(fridayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(fridayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(fridayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Saturday
                    case 6:
                        if (saturdayEnabled) {
                            if (saturdayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(saturdayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(saturdayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(saturdayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(saturdayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }

                    // Sunday
                    case 7:
                        if (sundayEnabled) {
                            if (sundayBreakEnabled) {
                                return !((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(sundayBreakStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(sundayBreakEnd, 'HH:mm')))));
                            }
                            return ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isAfter(moment(sundayStart, 'HH:mm'))) && ((moment(`${currentHourInTimezone}:${currentMinutesInTimezone}`, 'HH:mm').isBefore(moment(sundayEnd, 'HH:mm')))));
                        } else {
                            return false;
                        }
                    default:
                        return false;
                }
            }

            if (storeWorkingHoursInContext) {
                api.addToContext('workingHours', {
                    1: {
                        "dayOfWeek": "Monday",
                        "from": mondayStart,
                        "to": mondayEnd,
                    },
                    2: {
                        "dayOfWeek": "Tuesday",
                        "from": tuesdayStart,
                        "to": tuesdayEnd,
                    },
                    3: {
                        "dayOfWeek": "Wednesday",
                        "from": wednesdayStart,
                        "to": wednesdayEnd,
                    },
                    4: {
                        "dayOfWeek": "Thursday",
                        "from": thursdayStart,
                        "to": thursdayEnd,
                    },
                    5: {
                        "dayOfWeek": "Friday",
                        "from": fridayStart,
                        "to": fridayEnd,
                    },
                    6: {
                        "dayOfWeek": "Saturday",
                        "from": saturdayStart,
                        "to": saturdayEnd,
                    },
                    7: {
                        "dayOfWeek": "Sunday",
                        "from": sundayStart,
                        "to": sundayEnd,
                    }
                }, 'simple');
            }

            if (isInWorkingHours()) {
                const onOpenChild = childConfigs.find(child => child.type === "onOpen");
                api.setNextNode(onOpenChild.id);

            } else {
                const onClosedChild = childConfigs.find(child => child.type === "onClosed");
                api.setNextNode(onClosedChild.id);
            }

            // set the boolean value for the hours
            api.addToContext('handoverOpen', isInWorkingHours(), 'simple');
        }

    }
});

export const onOpen = createNodeDescriptor({
    type: "onOpen",
    parentType: "configureWorkingHours",
    defaultLabel: {
        deDE: "Geöffnet",
        default: "Geöffnet"
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onClosed = createNodeDescriptor({
    type: "onClosed",
    parentType: "configureWorkingHours",
    defaultLabel: {
        deDE: "Geschlossen",
        default: "Geschlossen"
    },
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
