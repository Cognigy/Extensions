import { createNodeDescriptor, INodeFunctionBaseParams } from '@cognigy/extension-tools';
import axios from 'axios';

interface IBigCommerceBrand {
    id: number,
    name: string,
    page_title: string,
    meta_keywords: string[],
    meta_description: string,
    image_url: string,
    search_keywords: string,
    custom_url: {
        url: string,
        is_customized: boolean
    }
}

interface IBigCommerceCategory {
    id: number,
    parent_id: number,
    name: string,
    description: string,
    views: number,
    sort_order: number,
    page_title: string,
    meta_keywords: string[],
    meta_description: string,
    layout_file: string,
    image_url: string,
    is_visible: boolean,
    search_keywords: string,
    default_product_sort: string,
    custom_url: {
        url: string,
        is_customized: boolean
    }
}

interface ISelectItem {
    value: any;
    label: string;
}

export interface IGetAllProductsParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
            storeHash: string;
        };
        keyword: string;
        brandId: number;
        categoryId: number;
        storeLocation: string;
        contextKey: string;
        inputKey: string;
    };
}

export const getAllProductsNode = createNodeDescriptor({
    type: 'getAllProducts',
    defaultLabel: {
        default: 'Get All Products'
    },
    summary: {
        default: 'Retrieves all products from the store'
    },
    fields: [
        {
            key: 'connection',
            label: {
                default: 'Store Access Token'
            },
            type: 'connection',
            params: {
                connectionType: 'store-api-access-token',
                required: true
            }
        },
        {
            key: 'keyword',
            label: {
                default: 'Keyword'
            },
            description: {
                default: 'Filter items by keywords found in the name, description, or sku fields, or in the brand name.'
            },
            type: 'cognigyText'
        },
        {
            key: 'brandId',
            label: {
                default: 'Brand'
            },
            description: {
                default: 'The optional brand to the products'
            },
            type: 'select',
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const brandsResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api.bigcommerce.com/stores/${config.connection.storeHash}/v3/catalog/brands`,
                            headers: {
                                "Accept": "application/json",
                                "X-Auth-Token": config.connection.accessToken
                            }
                        });

                        let selectItems: ISelectItem[] = [
                            {
                                label: "None",
                                value: null
                            }
                        ]

                        // map file list to "options array"
                        brandsResponse?.data?.data?.map((brand: IBigCommerceBrand) => {
                            selectItems.push({
                                label: brand?.name,
                                value: brand?.id,
                            });
                        });

                        return selectItems;
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: 'categoryId',
            label: {
                default: 'Category'
            },
            description: {
                default: 'The optional category to the products'
            },
            type: 'select',
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    try {
                        const categoriesResponse = await api.httpRequest({
                            method: "GET",
                            url: `https://api.bigcommerce.com/stores/${config.connection.storeHash}/v3/catalog/categories`,
                            headers: {
                                "Accept": "application/json",
                                "X-Auth-Token": config.connection.accessToken
                            }
                        });

                        let selectItems: ISelectItem[] = [
                            {
                                label: "None",
                                value: null
                            }
                        ]

                        // map file list to "options array"
                        categoriesResponse?.data?.data?.map((category: IBigCommerceCategory) => {
                            selectItems.push({
                                label: category?.name,
                                value: category?.id,
                            });
                        });

                        return selectItems;
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            }
        },
        {
            key: 'storeLocation',
            type: 'select',
            label: {
                default: 'Where to store the result'
            },
            defaultValue: 'input',
            params: {
                options: [
                    {
                        label: 'Input',
                        value: 'input'
                    },
                    {
                        label: 'Context',
                        value: 'context'
                    }
                ],
                required: true
            },
        },
        {
            key: 'inputKey',
            type: 'cognigyText',
            label: {
                default: 'Input Key to store Result'
            },
            defaultValue: 'bigcommerce.products',
            condition: {
                key: 'storeLocation',
                value: 'input',
            }
        },
        {
            key: 'contextKey',
            type: 'cognigyText',
            label: {
                default: 'Context Key to store Result'
            },
            defaultValue: 'bigcommerce.products',
            condition: {
                key: 'storeLocation',
                value: 'context',
            }
        }
    ],
    sections: [
        {
            key: 'storage',
            label: {
                default: 'Storage Option'
            },
            defaultCollapsed: true,
            fields: [
                'storeLocation',
                'inputKey',
                'contextKey'
            ]
        },
        {
            key: 'filter',
            label: {
                default: 'Filter'
            },
            defaultCollapsed: true,
            fields: [
                'keyword',
                'brandId',
                'categoryId',
            ]
        }
    ],
    form: [
        { type: 'field', key: 'connection' },
        { type: 'section', key: 'filter' },
        { type: 'section', key: 'storage' }
    ],
    appearance: {
        color: 'black'
    },
    function: async ({ cognigy, config }: IGetAllProductsParams) => {
        const { api } = cognigy;
        const { connection, brandId, categoryId, keyword, storeLocation, contextKey, inputKey } = config;
        const { storeHash, accessToken } = connection;

        try {

            const response = await axios({
                method: 'GET',
                url: `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/products?brand_id=${brandId}&categories:in=${categoryId}&keyword=${encodeURIComponent(keyword)}`,
                headers: {
                    'Accept': 'application/json',
                    'X-Auth-Token': accessToken
                }
            });

            if (storeLocation === 'context') {
                api.addToContext(contextKey, response?.data?.data, 'simple');
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response?.data?.data);
            }

        } catch (error) {
            api.log('error', error.message);
        }
    }
});