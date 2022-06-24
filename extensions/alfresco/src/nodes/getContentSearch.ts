import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetContentSearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			ALF_API_URL: string;
		},
		SearchTerm: string;
		rootNodeId: string;
		skipCount: string;
		no_results: string;
		Orderby: string;
		incfields: string;
		Includes: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getContentSearchNode = createNodeDescriptor({
	type: "getContentSearch",
	defaultLabel: "Seach for Content",
	summary: "Retrieves a list of content based on term",
	fields: [
		{
			key: "connection",
			label: "Alfresco Repository",
			type: "connection",
			params: {
				connectionType: "alfresco-instance",
				required: true
			}
		},
		{
			key: "SearchTerm",
			label: "Search Term",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "skipCount",
			label: "Start Count (SkipCount)",
			type: "cognigyText",
			defaultValue: "0",
			params: {
				required: true
			}
		},
		{
			key: "no_results",
			label: "No. of Results (maxItems)",
			type: "cognigyText",
			defaultValue: "100",
			params: {
				required: true
			}
		},
		{
			key: "Orderby",
			label: "Order by:  (Name ASC or DESC)",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "incfields",
			label: "Fields:  Return only these fields.  (ex: Name,createdByUser)",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "Includes",
			label: "Include: Returns additional information about the node (allowableOperations, aspectNames,isLink,isFavorite,isLocked,path,properties)",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "rootNodeId",
			label: "Root Node ID",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
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
			defaultValue: "context"
		},
		{
			key: "inputKey",
			type: "text",
			label: "Input Key to store Result",
			defaultValue: "alfresco.ContentSearch",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "text",
			label: "Context Key to store Result",
			defaultValue: "alfresco.ContentSearch",
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
		{ type: "field", key: "SearchTerm" },
		{ type: "field", key: "skipCount" },
		{ type: "field", key: "no_results" },
		{ type: "field", key: "Orderby" },
		{ type: "field", key: "incfields" },
		{ type: "field", key: "Includes" },
		{ type: "field", key: "rootNodeId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#ff2038"
	},
	dependencies: {
		children: [
			"onFoundContentSearch",
			"onNotFoundContentSearch"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetContentSearchParams) => {
		const { api } = cognigy;
		const { connection, SearchTerm, skipCount, no_results, Orderby, incfields, Includes, rootNodeId, storeLocation, inputKey, contextKey } = config;
		const { username, password, ALF_API_URL } = connection;
		let aurl = `${ALF_API_URL}/alfresco/api/-default-/public/alfresco/versions/1/queries/nodes?term=${SearchTerm}&skipCount=${skipCount}&maxItems=${no_results}`;
		if (rootNodeId !== "") {
			aurl = aurl.concat(`&rootNodeId=${rootNodeId}`);
		}
		if (Includes !== "") {
			aurl = aurl.concat(`&include=${Includes}`);
		}
		if (Orderby !== "") {
			aurl = aurl.concat(`&orderBy=${Orderby}`);
		}
		if (incfields !== "") {
			aurl = aurl.concat(`&fields=${incfields}`);
		}
		aurl = encodeURI(aurl);

		api.log("debug", JSON.stringify(aurl));
		try {
			const response = await axios({
				method: 'get',
				url: aurl,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				auth: {
					username,
					password
				}
			});
			if (response.data.length === 0) {
				const onNotFoundContentSearch = childConfigs.find(child => child.type === "onNotFoundContentSearch");
				api.setNextNode(onNotFoundContentSearch.id);
			} else {
				const onFoundContentSearch = childConfigs.find(child => child.type === "onFoundContentSearch");
				api.setNextNode(onFoundContentSearch.id);
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});

export const onFoundContentSearch = createNodeDescriptor({
	type: "onFoundContentSearch",
	parentType: "getContentSearch",
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

export const onNotFoundContentSearch = createNodeDescriptor({
	type: "onNotFoundContentSearch",
	parentType: "getContentSearch",
	defaultLabel: "On Not Found",
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