import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { handleQRCode } from "../handlers/handleQRCode";

export interface IShowTicketParams extends INodeFunctionBaseParams {
	config: {
		origin: string;
		destination: string;
		price: string;
		ticketType: string;
		ticketUrl: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const showTicketNode = createNodeDescriptor({
	type: "showTicket",
	defaultLabel: "Show Ticket",
	summary: "Shows a ticket",
	preview: {
		key: "destination",
		type: "text"
	},
	fields: [
		{
			key: "origin",
			label: "Origin",
			type: "cognigyText",
			description: "The transit station such as Berlin Hbf",
			params: {
				required: true
			}
		},
		{
			key: "destination",
			label: "Destination",
			type: "cognigyText",
			description: "The transit station such as Berlin Hbf",
			params: {
				required: true
			}
		},
		{
			key: "price",
			label: "Price",
			type: "cognigyText",
			description: "The price of the ticket",
			params: {
				required: true
			}
		},
		{
			key: "ticketType",
			label: "Ticket Type",
			type: "cognigyText",
			defaultValue: "Sparpreis",
			params: {
				required: true
			}
		},
		{
			key: "ticketUrl",
			label: "Ticket URL",
			type: "cognigyText",
			defaultValue: "https://cognigydemoimages.blob.core.windows.net/images/online-ticket.pdf",
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
			defaultValue: "db",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "db",
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "origin" },
		{ type: "field", key: "destination" },
		{ type: "field", key: "price" },
		{ type: "field", key: "ticketType" },
		{ type: "field", key: "ticketUrl" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "red"
	},
	function: async ({ cognigy, config }: IShowTicketParams) => {
		const { api } = cognigy;
		let { origin, destination, price, ticketType, ticketUrl, storeLocation, inputKey, contextKey } = config;

		try {

			const ticketUrlQrCode = await handleQRCode(ticketUrl);

			const outputData = {
				"_plugin": {
					"type": "adaptivecards",
					"payload": {
						"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
						"type": "AdaptiveCard",
						"version": "1.0",
						"body": [
							{
								"type": "Container",
								"style": "emphasis",
								"items": [
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"items": [
													{
														"type": "TextBlock",
														"size": "Large",
														"weight": "Bolder",
														"text": "Online Ticket",
														"wrap": true,
														"style": "heading"
													}
												],
												"width": "stretch"
											},
											{
												"type": "Column",
												"items": [
													{
														"type": "Image",
														"url": "https://cognigydemoimages.blob.core.windows.net/images/Deutsche-Bahn-Logo.png",
														"height": "30px",
														"altText": "Pending"
													}
												],
												"width": "auto"
											}
										]
									}
								],
								"bleed": true
							},
							{
								"type": "Container",
								"items": [
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"items": [
													{
														"type": "TextBlock",
														"size": "ExtraLarge",
														"text": ticketType,
														"wrap": true,
														"style": "heading"
													}
												],
												"width": "stretch"
											},
											{
												"type": "Column",
												"items": [
													{
														"type": "ActionSet",
														"actions": [
															{
																"type": "Action.OpenUrl",
																"title": "Download Ticket",
																"url": ticketUrl
															}
														]
													}
												],
												"width": "auto"
											}
										]
									},
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"width": "stretch",
												"items": [
													{
														"type": "ColumnSet",
														"columns": [
															{
																"type": "Column",
																"width": "stretch",
																"items": [
																	{
																		"type": "TextBlock",
																		"text": "Halt",
																		"wrap": true
																	},
																	{
																		"type": "TextBlock",
																		"text": origin,
																		"wrap": true
																	},
																	{
																		"type": "TextBlock",
																		"text": destination,
																		"wrap": true
																	}
																]
															},
															{
																"type": "Column",
																"width": "stretch",
																"items": [
																	{
																		"type": "TextBlock",
																		"text": "Zeit",
																		"wrap": true
																	},
																	{
																		"type": "TextBlock",
																		"text": "19.02.2021",
																		"wrap": true
																	},
																	{
																		"type": "TextBlock",
																		"text": "19.02",
																		"wrap": true
																	}
																]
															},
															{
																"type": "Column",
																"width": "stretch",
																"items": [
																	{
																		"type": "TextBlock",
																		"text": "Zeit",
																		"wrap": true
																	},
																	{
																		"type": "TextBlock",
																		"text": "7",
																		"wrap": true
																	}
																]
															}
														]
													}
												]
											},
											{
												"type": "Column",
												"width": "122px",
												"items": [
													{
														"type": "Image",
														"url": ticketUrlQrCode,
														"size": "Large",
														"width": "171px"
													}
												]
											}
										]
									}
								]
							},
							{
								"type": "Container",
								"spacing": "Large",
								"style": "emphasis",
								"items": [
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"spacing": "Large",
												"items": [
													{
														"type": "TextBlock",
														"weight": "Bolder",
														"text": "Positionen",
														"wrap": true
													}
												],
												"width": "stretch"
											},
											{
												"type": "Column",
												"items": [
													{
														"type": "TextBlock",
														"weight": "Bolder",
														"text": "Preis",
														"wrap": true
													}
												],
												"width": "auto"
											}
										]
									}
								],
								"bleed": true
							},
							{
								"type": "ColumnSet",
								"columns": [
									{
										"type": "Column",
										"spacing": "Medium",
										"items": [
											{
												"type": "TextBlock",
												"text": ticketType,
												"wrap": true
											}
										],
										"width": "stretch"
									},
									{
										"type": "Column",
										"items": [
											{
												"type": "TextBlock",
												"text": price,
												"wrap": true
											}
										],
										"width": "auto"
									}
								]
							},
							{
								"type": "ColumnSet",
								"columns": [
									{
										"type": "Column",
										"spacing": "Medium",
										"items": [
											{
												"type": "TextBlock",
												"text": "Sitzplatzreservierung",
												"wrap": true
											}
										],
										"width": "stretch"
									},
									{
										"type": "Column",
										"items": [
											{
												"type": "TextBlock",
												"text": "€10,00",
												"wrap": true
											}
										],
										"width": "auto"
									}
								]
							},
							{
								"type": "Container",
								"style": "emphasis",
								"items": [
									{
										"type": "ColumnSet",
										"columns": [
											{
												"type": "Column",
												"items": [
													{
														"type": "TextBlock",
														"horizontalAlignment": "Right",
														"text": "Summe",
														"wrap": true
													}
												],
												"width": "stretch"
											},
											{
												"type": "Column",
												"items": [
													{
														"type": "TextBlock",
														"weight": "Bolder",
														"text": "€99,55",
														"wrap": true
													}
												],
												"width": "auto"
											}
										]
									}
								],
								"bleed": true
							}
						]
					}
				}
			};

			api.say("", outputData);

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