
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IConfigureWorkingHoursParams extends INodeFunctionBaseParams {
    config: {
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
    };
}

export const configureWorkingHoursNode = createNodeDescriptor({
    type: "configureWorkingHours",
    defaultLabel: "Set Working Hours",
    fields: [
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
            key: "mondayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            }
        },
        {
            key: "mondayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
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
            key: "tuesdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            }
        },
        {
            key: "tuesdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
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
            key: "wednesdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            }
        },
        {
            key: "wednesdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
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
            key: "thursdayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            }
        },
        {
            key: "thursdayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
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
            key: "fridayStart",
            label: "From",
            type: "number",
            defaultValue: 9,
            params: {
                required: true
            }
        },
        {
            key: "fridayEnd",
            label: "To",
            type: "number",
            defaultValue: 18,
            params: {
                required: true
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
            key: "saturdayStart",
            label: "From",
            type: "number",
            defaultValue: 10,
            params: {
                required: true
            }
        },
        {
            key: "saturdayEnd",
            label: "To",
            type: "number",
            defaultValue: 14,
            params: {
                required: true
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
            key: "sundayStart",
            label: "From",
            type: "number",
            defaultValue: 1,
            params: {
                required: true
            }
        },
        {
            key: "sundayEnd",
            label: "To",
            type: "number",
            defaultValue: 1,
            params: {
                required: true
            }
        },
    ],
    form: [
        { type: "field", key: "mondayDescription" },
        { type: "field", key: "mondayStart" },
        { type: "field", key: "mondayEnd" },
        { type: "field", key: "tuesdayDescription" },
        { type: "field", key: "tuesdayStart" },
        { type: "field", key: "tuesdayEnd" },
        { type: "field", key: "wednesdayDescription" },
        { type: "field", key: "wednesdayStart" },
        { type: "field", key: "wednesdayEnd" },
        { type: "field", key: "thursdayDescription" },
        { type: "field", key: "thursdayStart" },
        { type: "field", key: "thursdayEnd" },
        { type: "field", key: "fridayDescription" },
        { type: "field", key: "fridayStart" },
        { type: "field", key: "fridayEnd" },
        { type: "field", key: "saturdayDescription" },
        { type: "field", key: "saturdayStart" },
        { type: "field", key: "saturdayEnd" },
        { type: "field", key: "sundayDescription" },
        { type: "field", key: "sundayStart" },
        { type: "field", key: "sundayEnd" },
    ],
    function: async ({ cognigy, config }: IConfigureWorkingHoursParams): Promise<any> => {
        const { api, input } = cognigy;
        const { mondayStart, mondayEnd, tuesdayStart, tuesdayEnd, wednesdayStart, wednesdayEnd, thursdayStart, thursdayEnd, fridayStart, fridayEnd, saturdayStart, saturdayEnd, sundayStart, sundayEnd } = config;

        function isChristmasOrNewYearsDay(): boolean {
            let month: number = input.currentTime.month;
            let day: number = input.currentTime.day;

            if ((month === 12 && day === 25) || (month === 1 && day === 1)) {
                return true;
            } else {
                return false;
            }
        }

        let holidayTest = isChristmasOrNewYearsDay();
        if (holidayTest === true) {
            api.log('info', 'Time is in holiday period');
            api.addToContext('handoverOpen', false, 'simple');
        } else {

            api.log('info', 'Check if time is in working hours');

            function isInWorkingHours(): boolean {
                let dayOfWeek: number = input.currentTime.weekday;
                let hour: number = input.currentTime.hour;

                switch (dayOfWeek) {

                    // Monday
                    case 1:
                        return (hour >= mondayStart && hour <= mondayEnd);

                    // Tuesday
                    case 2:
                        return (hour >= tuesdayStart && hour <= tuesdayEnd);

                    // Wednesday
                    case 3:
                        return (hour >= wednesdayStart && hour <= wednesdayEnd);

                    // Thursday
                    case 4:
                        return (hour >= thursdayStart && hour <= thursdayEnd);

                    // Friday
                    case 5:
                        return (hour >= fridayStart && hour <= fridayEnd);

                    // Saturday
                    case 6:
                        return (hour >= saturdayStart && hour <= saturdayEnd);

                    // Sunday
                    case 7:
                        return (hour >= sundayStart && hour <= sundayEnd);

                    default:
                        return false;
                }
            }

            api.addToContext('workingHours', {
                "monday": {
                    "from": mondayStart,
                    "to": mondayEnd,
                },
                "tuesday": {
                    "from": tuesdayStart,
                    "to": tuesdayEnd,
                },
                "wednesday": {
                    "from": wednesdayStart,
                    "to": wednesdayEnd,
                },
                "thursday": {
                    "from": thursdayStart,
                    "to": thursdayEnd,
                },
                "friday": {
                    "from": fridayStart,
                    "to": fridayEnd,
                },
                "saturday": {
                    "from": saturdayStart,
                    "to": saturdayEnd,
                },
                "sunday": {
                    "from": sundayStart,
                    "to": sundayEnd,
                }
            }, 'simple');

            // set the boolean value for the hours
            api.addToContext('handoverOpen', isInWorkingHours(), 'simple');
        }

    }
});