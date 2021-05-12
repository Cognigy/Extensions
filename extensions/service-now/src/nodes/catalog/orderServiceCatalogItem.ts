import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IOrderServiceCatalogItemParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            password: string;
            instance: string;
        };
        sysId: string;
        sysParamQuantity: number;
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const orderServiceCatalogItemNode = createNodeDescriptor({
    type: "orderServiceCatalogItem",
    defaultLabel: "Order Item Now (Service Catalog)",
    summary: "Orders the specific Service Catalog item",
    fields: [
        {
            key: "connection",
            label: "Service Now Connection",
            type: "connection",
            params: {
                connectionType: "snow",
                required: false
            }
        },
        {
            key: "sysId",
            label: "Item Id",
            description: "The ID of the item to order now",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "sysParamQuantity",
            label: "Quantity",
            description: "The quantity of the item",
            type: "number",
            defaultValue: 1,
            params: {
                required: true
            }
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
            defaultValue: "snow.catalog.order",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.catalog.order",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "sysId" },
        { type: "field", key: "sysParamQuantity" },
        { type: "section", key: "storageOption" }
    ],
    // tokens: [
    //     {
    //         label: "Service Catalog Request Number",
    //         script: "ci.snow.catalog.order.request_number",
    //         type: "answer"
    //     },
    //     {
    //         label: "Service Catalog Request Table Name",
    //         script: "ci.snow.catalog.order.table",
    //         type: "answer"
    //     },
    //     {
    //         label: "Service Catalog Order ID",
    //         script: "ci.snow.catalog.order.sys_id",
    //         type: "answer"
    //     }
    // ],
    appearance: {
        color: "#80b6a1"
    },
    dependencies: {
		children: [
			"onSuccessServiceCatalogOrderNow",
			"onErrorServiceCatalogOrderNow"
		]
	},
    function: async ({ cognigy, config, childConfigs }: IOrderServiceCatalogItemParams) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, sysId, sysParamQuantity } = config;
        const { username, password, instance } = connection;

        try {
            const response = await axios.post(`${instance}/api/sn_sc/servicecatalog/items/${sysId}/order_now`,
                {
                    sysparm_quantity: sysParamQuantity.toString()
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username,
                        password
                    }
                });


            const onSuccessChild = childConfigs.find(child => child.type === "onSuccessServiceCatalogOrderNow");
            api.setNextNode(onSuccessChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data.result, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, response.data.result);
            }
        } catch (error) {

            const onErrorChild = childConfigs.find(child => child.type === "onErrorServiceCatalogOrderNow");
            api.setNextNode(onErrorChild.id);

            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error.message }, "simple");
            } else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});

export const onSuccessServiceCatalogOrderNow = createNodeDescriptor({
    type: "onSuccessServiceCatalogOrderNow",
    parentType: "orderServiceCatalogItem",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});

export const onErrorServiceCatalogOrderNow = createNodeDescriptor({
    type: "onErrorServiceCatalogOrderNow",
    parentType: "orderServiceCatalogItem",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});