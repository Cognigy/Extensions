
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as momenttimezone from "moment-timezone";
import * as moment from "moment";

export interface IConfigureWorkingHoursParams extends INodeFunctionBaseParams {
    config: {
        timezone: string;
        mondayStart: number;
        mondayEnd: number;
        tuesdayStart: number;
        tuesdayEnd: number;
        wednesdayStart: number;
        wednesdayEnd: number;
        thursdayStart: number;
        thursdayEnd: number;
        fridayStart: number;
        fridayEnd: number;
        saturdayStart: number;
        saturdayEnd: number;
        sundayStart: number;
        sundayEnd: number;
        mondayEnabled: boolean;
        tuesdayEnabled: boolean;
        wednesdayEnabled: boolean;
        thursdayEnabled: boolean;
        fridayEnabled: boolean;
        saturdayEnabled: boolean;
        sundayEnabled: boolean;
        storeWorkingHoursInContext: boolean;
        enableClosedDates: boolean;
        closedDates: string[];
    };
}

export const configureWorkingHoursNode = createNodeDescriptor({
    type: "configureWorkingHours",
    defaultLabel: "Set Working Hours",
    fields: [
        {
            key: "timezone",
            type: "select",
            label: "Timezone",
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
                        label: "Los Angeles, America",
                        value: "America/New_York"
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
                        label: "New York, America",
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
                text: "Monday"
            }
        },
        {
            key: "mondayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "mondayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            },
            condition: {
                key: "mondayEnabled",
                value: true
            }
        },
        {
            key: "mondayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
            },
            condition: {
                key: "mondayEnabled",
                value: true
            }
        },

        {
            key: "tuesdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Tuesday"
            }
        },
        {
            key: "tuesdayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "tuesdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            },
            condition: {
                key: "tuesdayEnabled",
                value: true
            }
        },
        {
            key: "tuesdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
            },
            condition: {
                key: "tuesdayEnabled",
                value: true
            }
        },
        {
            key: "wednesdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Wednesday"
            }
        },
        {
            key: "wednesdayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "wednesdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            },
            condition: {
                key: "wednesdayEnabled",
                value: true
            }
        },
        {
            key: "wednesdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
            },
            condition: {
                key: "wednesdayEnabled",
                value: true
            }
        },
        {
            key: "thursdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Thursday"
            }
        },
        {
            key: "thursdayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "thursdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            },
            condition: {
                key: "thursdayEnabled",
                value: true
            }
        },
        {
            key: "thursdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
            },
            condition: {
                key: "thursdayEnabled",
                value: true
            }
        },
        {
            key: "fridayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Friday"
            }
        },
        {
            key: "fridayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: true,
            params: {
                required: true
            }
        },
        {
            key: "fridayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            },
            condition: {
                key: "fridayEnabled",
                value: true
            }
        },
        {
            key: "fridayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
            },
            condition: {
                key: "fridayEnabled",
                value: true
            }
        },
        {
            key: "saturdayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Saturday"
            }
        },
        {
            key: "saturdayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: false,
            params: {
                required: true
            }
        },
        {
            key: "saturdayStart",
            label: "From",
            type: "number",
            defaultValue: 10,
            params: {
                required: true
            },
            condition: {
                key: "saturdayEnabled",
                value: true
            }
        },
        {
            key: "saturdayEnd",
            label: "To",
            type: "number",
            defaultValue: 14,
            params: {
                required: true
            },
            condition: {
                key: "saturdayEnabled",
                value: true
            }
        },
        {
            key: "sundayDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Sunday"
            }
        },
        {
            key: "sundayEnabled",
            type: "toggle",
            label: "Open",
            defaultValue: false,
            params: {
                required: true
            }
        },
        {
            key: "sundayStart",
            label: "From",
            type: "number",
            defaultValue: 10,
            params: {
                required: true
            },
            condition: {
                key: "sundayEnabled",
                value: true
            }
        },
        {
            key: "sundayEnd",
            label: "To",
            type: "number",
            defaultValue: 12,
            params: {
                required: true
            },
            condition: {
                key: "sundayEnabled",
                value: true
            }
        },
        {
            key: "storeWorkingHoursInContext",
            label: "Sore Working Hours in Context",
            type: "toggle",
            defaultValue: false,
        },
        {
            key: "enableClosedDates",
            type: "toggle",
            defaultValue: false,
            description: "Whether there are dates when the office is closed or not",
            label: "Add Closed Dates"
        },
        {
            key: "closedDatesDescription",
            // @ts-ignore
            type: "description",
            label: " ",
            params: {
                text: "Provide a list of dates when the office or store is closed. Please insert one date per row only and use the dateformat DD.MM.YYYY, such as 14.01.2024."
            },
            condition: {
                key: "enableClosedDates",
                value: true
            }
        },
        {
            key: "closedDates",
            label: "Closed Dates",
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
        { type: "field", key: "mondayDescription" },
        { type: "field", "key": "mondayEnabled" },
        { type: "field", key: "mondayStart" },
        { type: "field", key: "mondayEnd" },
        { type: "field", key: "tuesdayDescription" },
        { type: "field", "key": "tuesdayEnabled" },
        { type: "field", key: "tuesdayStart" },
        { type: "field", key: "tuesdayEnd" },
        { type: "field", key: "wednesdayDescription" },
        { type: "field", "key": "wednesdayEnabled" },
        { type: "field", key: "wednesdayStart" },
        { type: "field", key: "wednesdayEnd" },
        { type: "field", key: "thursdayDescription" },
        { type: "field", "key": "thursdayEnabled" },
        { type: "field", key: "thursdayStart" },
        { type: "field", key: "thursdayEnd" },
        { type: "field", key: "fridayDescription" },
        { type: "field", "key": "fridayEnabled" },
        { type: "field", key: "fridayStart" },
        { type: "field", key: "fridayEnd" },
        { type: "field", key: "saturdayDescription" },
        { type: "field", "key": "saturdayEnabled" },
        { type: "field", key: "saturdayStart" },
        { type: "field", key: "saturdayEnd" },
        { type: "field", key: "sundayDescription" },
        { type: "field", "key": "sundayEnabled" },
        { type: "field", key: "sundayStart" },
        { type: "field", key: "sundayEnd" },
        { type: "section", key: "advanced" }
    ],
    sections: [
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "storeWorkingHoursInContext",
                "enableClosedDates",
                "closedDatesDescription",
                "closedDates"
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
    function: async ({ cognigy, config }: IConfigureWorkingHoursParams): Promise<any> => {
        const { api, input } = cognigy;
        const { timezone, mondayStart, mondayEnd, tuesdayStart, tuesdayEnd, wednesdayStart, wednesdayEnd, thursdayStart, thursdayEnd, fridayStart, fridayEnd, saturdayStart, saturdayEnd, sundayStart, sundayEnd, storeWorkingHoursInContext, mondayEnabled, thursdayEnabled, wednesdayEnabled, tuesdayEnabled, fridayEnabled, saturdayEnabled, sundayEnabled, enableClosedDates, closedDates } = config;

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

                switch (currentDayOfWeekInTimezone) {

                    // Monday
                    case 1:
                        if (mondayEnabled) return (currentHourInTimezone >= mondayStart && currentHourInTimezone <= mondayEnd);
                        else return false;

                    // Tuesday
                    case 2:
                        if (tuesdayEnabled) return (currentHourInTimezone >= tuesdayStart && currentHourInTimezone <= tuesdayEnd);
                        else return false;

                    // Wednesday
                    case 3:
                        if (wednesdayEnabled) return (currentHourInTimezone >= wednesdayStart && currentHourInTimezone <= wednesdayEnd);
                        else return false;

                    // Thursday
                    case 4:
                        if (thursdayEnabled) return (currentHourInTimezone >= thursdayStart && currentHourInTimezone <= thursdayEnd);
                        else return false;

                    // Friday
                    case 5:
                        if (fridayEnabled) return (currentHourInTimezone >= fridayStart && currentHourInTimezone <= fridayEnd);
                        else return false;

                    // Saturday
                    case 6:
                        if (saturdayEnabled) return (currentHourInTimezone >= saturdayStart && currentHourInTimezone <= saturdayEnd);
                        else return false;

                    // Sunday
                    case 7:
                        if (sundayEnabled) return (currentHourInTimezone >= sundayStart && currentHourInTimezone <= sundayEnd);
                        else return false;

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

            // set the boolean value for the hours
            api.addToContext('handoverOpen', isInWorkingHours(), 'simple');
        }

    }
});