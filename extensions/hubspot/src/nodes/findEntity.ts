import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IFindEntityParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        entityType: string;
        searchField: string;
        searchValue: string;
        properties: string;
        limit: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const findEntity = createNodeDescriptor({
    type: "findEntity",
    defaultLabel: "Find Entity",
    summary: "Finds contacts, companies, or tickets in HubSpot by various fields",
    fields: [
        {
            key: "connection",
            label: "HubSpot Connection",
            type: "connection",
            params: {
                connectionType: "hubspot",
                required: true
            }
        },
        {
            key: "entityType",
            label: "Entity Type",
            type: "select",
            defaultValue: "contact",
            params: {
                options: [
                    {
                        label: "Contact",
                        value: "contact"
                    },
                    {
                        label: "Company",
                        value: "company"
                    },
                    {
                        label: "Ticket",
                        value: "ticket"
                    }
                ],
                required: true
            }
        },
        {
            key: "searchField",
            label: "Search Field",
            type: "select",
            defaultValue: "email",
            params: {
                options: [
                    // Contact fields
                    {
                        label: "Email",
                        value: "email",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "First Name",
                        value: "firstname",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "Last Name",
                        value: "lastname",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "Phone",
                        value: "phone",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "Company",
                        value: "company",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "Job Title",
                        value: "jobtitle",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "City",
                        value: "city",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "State/Region",
                        value: "state",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    {
                        label: "Country",
                        value: "country",
                        condition: {
                            key: "entityType",
                            value: "contact"
                        }
                    },
                    // Company fields
                    {
                        label: "Company Name",
                        value: "name",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "Domain",
                        value: "domain",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "Phone",
                        value: "phone",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "Industry",
                        value: "industry",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "City",
                        value: "city",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "State/Region",
                        value: "state",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "Country",
                        value: "country",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    {
                        label: "Website",
                        value: "website",
                        condition: {
                            key: "entityType",
                            value: "company"
                        }
                    },
                    // Ticket fields
                    {
                        label: "Subject",
                        value: "subject",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Pipeline",
                        value: "hs_pipeline",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Pipeline Stage",
                        value: "hs_pipeline_stage",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Priority",
                        value: "hs_ticket_priority",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Category",
                        value: "hs_ticket_category",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Source",
                        value: "source_type",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    },
                    {
                        label: "Ticket ID",
                        value: "hs_object_id",
                        condition: {
                            key: "entityType",
                            value: "ticket"
                        }
                    }
                ],
                required: true
            }
        },
        {
            key: "searchValue",
            label: "Search Value",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "properties",
            label: "Properties to Return",
            type: "cognigyText",
            defaultValue: "email,firstname,lastname,phone,company,city,state,country",
            description: "Comma-separated list of properties to return",
            condition: {
                key: "entityType",
                value: "contact"
            }
        },
        {
            key: "properties",
            label: "Properties to Return",
            type: "cognigyText",
            defaultValue: "name,domain,phone,industry,city,state,country,website",
            description: "Comma-separated list of properties to return",
            condition: {
                key: "entityType",
                value: "company"
            }
        },
        {
            key: "properties",
            label: "Properties to Return",
            type: "cognigyText",
            defaultValue: "subject,hs_pipeline,hs_pipeline_stage,hs_ticket_priority,hs_ticket_category,source_type,createdate,hs_lastmodifieddate",
            description: "Comma-separated list of properties to return",
            condition: {
                key: "entityType",
                value: "ticket"
            }
        },
        {
            key: "limit",
            label: "Result Limit",
            type: "number",
            defaultValue: 10,
            params: {
                min: 1,
                max: 100
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            defaultValue: "input",
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
            }
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "entity",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "entity",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "searchOptions",
            label: "Search Options",
            defaultCollapsed: false,
            fields: [
                "entityType",
                "searchField",
                "searchValue",
                "properties",
                "limit"
            ]
        },
        {
            key: "storageOptions",
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
        { type: "field", key: "connection" },
        { type: "section", key: "searchOptions" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: IFindEntityParams) => {
        const { api } = cognigy;
        const { connection, entityType, searchField, searchValue, properties, limit, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });
            
            // Convert comma-separated properties string to array
            const propertyArray = properties.split(',').map(prop => prop.trim());
            
            // Define search criteria
            const searchCriteria = {
                filterGroups: [{
                    filters: [{
                        propertyName: searchField,
                        operator: "EQ",
                        value: searchValue
                    }]
                }],
                sorts: [],
                after: 0,
                properties: propertyArray,
                limit: limit
            };
            
            let searchResponse;
            
            // Perform search based on entity type
            if (entityType === 'contact') {
                searchResponse = await client.crm.contacts.searchApi.doSearch(searchCriteria as any);
            } else if (entityType === 'company') {
                searchResponse = await client.crm.companies.searchApi.doSearch(searchCriteria as any);
            } else if (entityType === 'ticket') {
                searchResponse = await client.crm.tickets.searchApi.doSearch(searchCriteria as any);
            } else {
                throw new Error(`Unsupported entity type: ${entityType}`);
            }

            if (searchResponse.total === 0) {
                const errorMessage = `No ${entityType}s found matching criteria`;
                if (storeLocation === "context") {
                    api.addToContext("error", errorMessage, "simple");
                    api.addToContext("success", false, "simple");
                } else {
                    api.addToInput("error", errorMessage);
                    api.addToInput("success", false);
                }
                return;
            }

            // Store the results based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, searchResponse.results, "simple");
                api.addToContext(`${contextKey}Count`, searchResponse.total, "simple");
                api.addToContext("entityType", entityType, "simple");
                api.addToContext("success", true, "simple");
            } else {
                api.addToInput(inputKey, searchResponse.results);
                api.addToInput(`${inputKey}Count`, searchResponse.total);
                api.addToInput("entityType", entityType);
                api.addToInput("success", true);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (storeLocation === "context") {
                api.addToContext("error", errorMessage, "simple");
                api.addToContext("success", false, "simple");
            } else {
                api.addToInput("error", errorMessage);
                api.addToInput("success", false);
            }
        }
    }) as any
}); 