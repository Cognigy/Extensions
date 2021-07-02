import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

import axios from 'axios';
import {INodeExecutionAPI} from "@cognigy/extension-tools/build/interfaces/descriptor";

const CONST_HOUR_TYPE_HOLIDAY = '/HOLIDAY/';
const CONST_HOUR_TYPE_HOOP = '/HOOP/';
const CONST_CALL_FLOW  = '/callflow/';
const CONST_IS_OPEN  = '/isOpen';

export interface IHoursParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            apiKey: string;
            tenantId: string;
            domain: string;
        };
        holidayURL: string;
        hoopsURL: string;
        holidayContextKey: string;
        hoopsContextKey: string;
    };
}

export const hoursNode = createNodeDescriptor({
    type: "hours",
    defaultLabel: "Hours",
    fields: [
        {
            key: "connection",
            label: "Avaya API Connection",
            type: "connection",
            params: {
                connectionType: "avaya-api",
                required: true
            }
        },
        {
            key: "holidayURL",
            label: "Holiday Id or URL",
            type: "cognigyText"
        },
        {
            key: "hoopsURL",
            label: "Hoops Id or URL",
            type: "cognigyText"
        },
        {
            key: "holidayContextKey",
            type: "cognigyText",
            label: "Context Key to store Holiday Result",
            defaultValue: "holiday"
        },
        {
            key: "hoopsContextKey",
            type: "cognigyText",
            label: "Context Key to store Hoops Result",
            defaultValue: "hoops"
        }
    ],
    sections: [
        {
            key: "holidayStorage",
            label: "Holiday Storage Option",
            defaultCollapsed: true,
            fields: [
                "holidayContextKey"
            ]
        },
        {
            key: "hoopsStorage",
            label: "Hoops Storage Option",
            defaultCollapsed: true,
            fields: [
                "hoopsContextKey"
            ]
        },
    ],
    form: [
        {
            type: "field",
            key: "connection"
        },
        {
            type: "field",
            key: "holidayURL"
        },
        {
            type: "field",
            key: "hoopsURL"
        },
        {
            type: "section",
            key: "holidayStorage"
        },
        {
            type: "section",
            key: "hoopsStorage"
        }
    ],
    tokens: [
        {
            label: "Office Open",
            script: "{{cc.holiday.open}} && {{cc.hoops.open}}",
            type: "context"
        },
    ],
    function: async({ cognigy, config }: IHoursParams) => {
        const { api } = cognigy;
        const { connection, holidayURL, hoopsURL, holidayContextKey, hoopsContextKey } = config;
        const { apiKey, tenantId, domain } = connection;
        if (holidayURL !== '') {
            const result = await getOfficeHours(apiKey, holidayURL, CONST_HOUR_TYPE_HOLIDAY, domain, tenantId, holidayContextKey, api);
            api.addToContext(holidayContextKey, result.data, "simple");
            api.log("info", "api.addToContextHoliday() called");
        }
        if (hoopsURL !== '') {
            const result = await getOfficeHours(apiKey, hoopsURL, CONST_HOUR_TYPE_HOOP, domain, tenantId, hoopsContextKey, api);
            api.addToContext(hoopsContextKey, result.data, "simple");
            api.log("info", "api.addToContextHoops() called");
        }
    }
});

/**
 * Get daily operational Office hour and holiday office operational hours
 * @param apikey
 * @param url <user input>
 * @param domain will have base url <connection user input>
 * @param tenant Id <connection user input >
 * @param contextKey <context storage variable name given by user>
 */

async function getOfficeHours(apiKey: string, url: string, hourType: string, domain: string, tenantId: string, contextKey: string, api: INodeExecutionAPI ): Promise<any> {
    try {
        let newURL = url;
        if (url.startsWith("https") === false) {
            let profileId = url;
            newURL = domain + CONST_CALL_FLOW + tenantId + hourType + profileId + CONST_IS_OPEN;
        }
        return await axios({
            method: "GET",
            url: `${newURL}`,
            headers: {
                "x-api-Key": apiKey
            }
        });
    } catch (err) {
        api.addToContext(contextKey, err, "simple");
    }
}

