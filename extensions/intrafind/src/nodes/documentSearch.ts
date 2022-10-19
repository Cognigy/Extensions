import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';

export interface IdocumentSearchParams extends INodeFunctionBaseParams {
    config: {
        searchURL: string;
        searchTerm: string;
        listSize: number;
        specifyFields: boolean;
        queryFields: string[];
        indexName: boolean;
        strBody: boolean;
        strTitle: boolean;
        strURL: boolean;
        strLanguage: boolean;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const documentSearchNode = createNodeDescriptor({
    type: "documentSearch",
    defaultLabel: "Search Documents",
    summary: "Search for Documents via Intrafind",
    fields: [
        {
            key: "searchURL",
            label: "Search URL",
            type: "cognigyText",
            description: "The URL for the Intrafind server. Ex.: http://companyname.server.com\search",
        },
        {
            key: "searchTerm",
            label: "Search Term",
            type: "cognigyText",
            description: "The term to use when searching the documents.",
        },
        {
            key: "listSize",
            label: "List Size.",
            type: "slider",
            description: "The amount of results to receive back from the search",
            defaultValue: 2,
            params: {
                required: true,
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            key: "specifyFields",
            type: "toggle",
            label: "Specify Fields",
            description: "Specify which fields to return in the search",
            defaultValue: false
        },
        {
            key: "queryFields",
            type: "textArray",
            label: "Filter Queries",
            description: "Add filter queries to search. Ex.: _facet.indexname:Sharepoint",
            defaultValue: false
        },
        {
            key: "indexName",
            description: "The name of the index the file can be found in",
            type: "checkbox",
            label: "Index Name",
            defaultValue: false,
            condition: {
                key: "specifyFields",
                value: true
            }
        },
        {
            key: "strBody",
            type: "checkbox",
            label: "Text of Document",
            defaultValue: false,
            condition: {
                key: "specifyFields",
                value: true
            }
        },
        {
            key: "strTitle",
            type: "checkbox",
            label: "Document Name",
            defaultValue: false,
            condition: {
                key: "specifyFields",
                value: true
            }
        },
        {
            key: "strURL",
            type: "checkbox",
            label: "Document URL",
            defaultValue: false,
            condition: {
                key: "specifyFields",
                value: true
            }
        },
        {
            key: "strLanguage",
            type: "checkbox",
            label: "Language of Document",
            defaultValue: false,
            condition: {
                key: "specifyFields",
                value: true
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to Store the Result",
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
            label: "Input Key to Store Result",
            defaultValue: "intrafindResults",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "intrafindResults",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "queryFieldsDropdown",
            label: "Query Options",
            defaultCollapsed: true,
            fields: [
                "queryFields"
            ]
        },
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "searchURL" },
        { type: "field", key: "searchTerm" },
        { type: "field", key: "listSize" },
        { type: "field", key: "specifyFields" },
        { type: "field", key: "indexName" },
        { type: "field", key: "strBody" },
        { type: "field", key: "strTitle" },
        { type: "field", key: "strURL" },
        { type: "field", key: "strLanguage" },
        { type: "section", key: "queryFieldsDropdown" },
        { type: "section", key: "storageOption" }
    ],
    appearance: {
        color: "#ab191c"
    },
    dependencies: {
        children: [
            "onFoundResults",
            "onEmptyResults"
        ]
    },
    function: async ({ cognigy, config, childConfigs }: IdocumentSearchParams) => {
        const { api } = cognigy;
        const { searchURL, searchTerm, listSize, specifyFields, indexName, strBody, strTitle, strURL, strLanguage, storeLocation, queryFields, inputKey, contextKey } = config;
        // const { apiKey } = apiConnection;

        const fields = [];
        if (indexName === true) {
            fields.push("_facet.indexname");
        }
        if (strBody === true) {
            fields.push("_str.body");
        }
        if (strTitle === true) {
            fields.push("_str.title");
        }
        if (strURL === true) {
            fields.push("_str.url");
        }
        if (strLanguage === true) {
            fields.push("_str.languages");
        }

        const endpoint = searchURL;

        const searchParameters = {
            'method': 'search',
            'param0': searchTerm,
            'hits.list.size': listSize
        };
        if (specifyFields === true) {
            const fieldsMod = fields.join(',');
            searchParameters["return.fields"] = fieldsMod;
        }
        if (queryFields.length > 0) {
            const queryFieldsMod = queryFields.join(' AND ');
            searchParameters["filter.query"] = queryFieldsMod;
        }

        const params = qs.stringify(searchParameters);

        try {
            const result: AxiosResponse = await axios.post(endpoint, params, {
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (result.data.documents.length === 0) {
                const onEmptyResultsChild = childConfigs.find(child => child.type === "onEmptyResults");
                api.setNextNode(onEmptyResultsChild.id);
            } else {
                const onFoundChild = childConfigs.find(child => child.type === "onFoundResults");
                api.setNextNode(onFoundChild.id);
            }

            if (storeLocation === 'context') {
                api.addToContext(contextKey, result.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, result.data);
            }
        } catch (error) {
            if (storeLocation === 'context') {
                api.addToContext(contextKey, { error: error.message }, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});

export const onFoundResults = createNodeDescriptor({
    type: "onFoundResults",
    parentType: "documentSearch",
    defaultLabel: "On Found",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onEmptyResults = createNodeDescriptor({
    type: "onEmptyResults",
    parentType: "documentSearch",
    defaultLabel: "On Empty Result",
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});