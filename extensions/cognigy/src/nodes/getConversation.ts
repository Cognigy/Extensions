
import axios from 'axios';
import * as moment from 'moment';
import * as cssInliner from 'juice';

import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

/** Object pretty-print, for logging: */
function opretty(o: any): string { return JSON.stringify(o, null, 4) || '<falsey>'; }
/** Simple interface to define an object with string properties: */
interface IStringProps { [key: string]: string; }


export interface IGetConversationParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
		};
		odataBaseUrl: string;
		userId: string;
		sessionId: string;
		outputType: "json" | "html";
		tzOffset: string;
		storeLocation: "input" | "context";
		contextKey: string;
		inputKey: string;
	};
}

export const getConversationNode = createNodeDescriptor({
	type: "getConversation",
	defaultLabel: "Get Conversation",
	fields: [
		{
			key: "connection",
			label: "Cognigy API Connection",
			type: "connection",
			params: {
				connectionType: "cognigy-api",
				required: true
			}
		},
		{
			key: "odataBaseUrl",
			label: "OData Base URL",
			type: "cognigyText",
			defaultValue: "https://odata-trial.cognigy.ai",
		},
		{
			key: "userId",
			label: "Conversation User ID",
			type: "cognigyText",
			defaultValue: "{{ci.userId}}",
		},
		{
			key: "sessionId",
			label: "Conversation Session ID",
			type: "cognigyText",
			defaultValue: "{{ci.sessionId}}",
		},
		{
			key: "outputType",
			type: "select",
			label: "Output Type",
			defaultValue: "json",
			params: {
				options: [
					{
						label: "JSON",
						value: "json"
					},
					{
						label: "HTML",
						value: "html"
					}
				],
				required: true
			},
		},
		{
			key: "tzOffset",
			type: "cognigyText",
			label: "User Timezone Offset",
			defaultValue: "-6",
			condition: {
				key: "outputType",
				value: "html",
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
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "conversation",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "conversation",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},

	],
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"outputType",
				"tzOffset"
			]
		},
		{
			key: "storage",
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
		{ type: "field", key: "odataBaseUrl" },
		{ type: "field", key: "userId" },
		{ type: "field", key: "sessionId" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	// function: getConversationFunction
	function: async ({ cognigy, config }: IGetConversationParams): Promise<any> => {
		const { api } = cognigy;
		const { connection, odataBaseUrl, userId, sessionId, outputType, tzOffset, storeLocation, inputKey, contextKey } = config;
		const { apiKey } = connection;

		const me = 'get-conversation';

		for (let a of ['odataBaseUrl', 'outputType', 'tzOffset', 'storeLocation']) {
			if (!config[a]) throw new Error(`${me}: Argument ${a} is missing.`);
		}
		if (!config.connection || !config.connection.apiKey) {
			throw new Error(`${me}: The Connection did not contain 'apiKey'.`);
		}

		// DEBUG logging can be controlled by the array cc.DEBUG=['GetConversation','SomethingElse'] :
		let LOG = (msg: string) => { /* No-op */ };
		const DEBUG = cognigy.context.DEBUG;
		if (Array.isArray(DEBUG) && DEBUG.includes(me)) {
			LOG = (msg: any) => cognigy.api.log('debug', `${me}: ${msg}`);
		}


		if (outputType === 'html') {
			if (!tzOffset || !tzOffset.match(/^([+-][0-9]+)|0$/)) {
				throw new Error(`${me}: For HtmlFormat please supply tzOffset like "-10" or "+3" (hours) up to +/-16, or "-390" (minutes) for partial hour offsets.`);
			}
		}


		/** OData predicates, included as URL params below: */
		const odataPredicates = [
			// Reduce data size with select:
			`$select=type,source,channel,inputText,inputData,timestamp`,
			// And order by time: (Otherwise they CAN come in strange order)
			`$orderby=timestamp`
		];
		// Filter to the requested user-session (of course!)
		if (userId && sessionId) {
			odataPredicates.push(`$filter=contactId eq '${userId}' and sessionId eq '${sessionId}'`);
		} else if (userId) {
			odataPredicates.push(`$filter=contactId eq '${userId}'`);
			odataPredicates[0] += `,sessionId`;
		} else if (sessionId) {
			odataPredicates.push(`$filter=sessionId eq '${sessionId}'`);
			odataPredicates[0] += `,contactId`;
		} else
			throw new Error(`${me}: Please supply one or both of: User ID and/or Session ID.`);


		const reqUrl = `${odataBaseUrl}/v2.3/Conversations?${odataPredicates.join("&")}&apikey=${apiKey}`;
		// Log the URL, but obscure a chunk of the apiKey:
		LOG("Request URL:" + reqUrl.substring(0, reqUrl.length - 20) + " <...apiKey>");

		try {
			const response = await axios.get(reqUrl);

			LOG(`Got response: statusCode:${response.status}, body(partial):${opretty(response.data).substr(0, 2000)}`);

			// Safe defaults:
			const returnVal = {
				status: "UNKNOWN",
				statusMessage: "",
				channel: 'unknown' as string,
				transcript: [],
				html: '',
			};

			if (response.status !== 200 || !Array.isArray(response.data.value)) {
				returnVal.status = "ERROR";
				returnVal.statusMessage = response.data;
			} else {
				returnVal.status = "OK";

				/** Collection of mappings of QRs: payload -> title */
				const QRs: IStringProps = {};

				returnVal.transcript = response.data.value.map((event: IStringProps) => {

					// Just pull out a few select values:
					const { type, source, channel, inputText, inputData: inputDataString, timestamp, sessionId: dataSessionId } = event;
					const inputData = inputDataString && JSON.parse(inputDataString);
					// LOG("Input data: " + pretty(inputData));


					/** By default, use the plain inputText: */
					let textTranscript = inputText;
					// But there could be channel customisations:
					// Fairly limited logic supported for now:
					if (channel === 'adminconsole') {
						textTranscript = inputText
							|| inputData?._cognigy?._webchat?.message?.text
							|| inputData?._cognigy?._facebook?.message?.text;
					} else if (channel.startsWith('webchat')) {

						textTranscript = inputData?._cognigy?._webchat?.message?.text
							|| inputData?._cognigy?._facebook?.message?.text
							|| inputText;
					}

					if (channel === 'adminconsole' || channel.startsWith('webchat')) {
						// Store any QR's we see, so we can map 'payload' to 'title' in transcript:
						for (let qr of
							inputData?._cognigy?._webchat?.message?.quick_replies ||
							inputData?._cognigy?._facebook?.message?.quick_replies ||
							[]) {
							QRs[qr.payload] = qr.title;
						}
						// Check if user 'input' matches a QR payload:
						if (textTranscript && (textTranscript.includes(':') || textTranscript.includes('_'))) {
							const qrTitle = QRs[textTranscript];
							if (qrTitle) textTranscript = `(${qrTitle})`;
						}

					}


					// Set overall channel to first non-null channel:
					if (returnVal.channel === 'unknown' && channel) returnVal.channel = channel;

					const item: any = { type, source, text: textTranscript, data: inputData, timestamp };
					if (dataSessionId) {
						item.sessionId = dataSessionId;
						item.channel = channel;
					}
					return item;

				});
			}
			LOG(`Return value (partial):${opretty(returnVal).substr(0, 2000)}`);


			if (outputType === 'html') {
				//
				// If requested, convert the transcript to nice HTML:
				//

				// Default styles, can be over-ridden by user via 'input.GetConversationStyles':
				const styles = cognigy.input.GetConversationStyles || `
					<style>
						table { font-family: arial; border-collapse: collapse; outline:thin solid; }
						tr { padding: 8; }
						td { padding: 8; }
						tr.bot { background: #DDDDFF; }
						tr.user {}
						td.user-time {}
						td.bot-time {}
						td.user-source {}
						td.bot-source {}
						td.user-text { font-weight: bold; }
						td.bot-text {}
					</style>
				`;

				// Default time format, can be over-ridden by user via 'ci.GetConversationTimeFormat':
				const timeFormat = cognigy.input.GetConversationTimeFormat || '[(]HH:mm:ss[)]';

				const htmlContent: string[] = [];
				//
				// NOTE: Email clients deal with whitespace between tags inconsistently, so:
				//  ENSURE NO STRAY WHITESPACE IN ANY OF THE TABLE TAGS BELOW:
				//
				htmlContent.push(`<table>`);
				let lastSource = '';
				for (let entry of returnVal.transcript) {
					// Not sure if this combo of .utc() and .utcOffset() works: To Be Tested:
					const time = moment.utc(entry.timestamp).utcOffset(tzOffset);

					if (entry.text && entry.text.startsWith('cIntent:')) {
						console.warn(`###### Ignoring entry.text with "cIntent:". Entry details:\n` + opretty(entry));
					} else if (!entry.text) {
						console.warn(`###### Ignoring falsy entry.text. Entry details:\n` + opretty(entry));
					} else {

						const sourceShow = (entry.source === lastSource) ? '' : entry.source;
						lastSource = entry.source;

						// NOTE: ENSURE NO WHITESPACE BETWEEN TAGS HERE :
						htmlContent.push(`<tr class='${entry.source}'>`);
						htmlContent.push(`<td class='${entry.source}-time'>${time.format(timeFormat)}</td>`);
						htmlContent.push(`<td class='${entry.source}-source'>${sourceShow}</td>`);
						htmlContent.push(`<td class='${entry.source}-text'>${entry.text}</td>`);
						htmlContent.push(`</tr>`);
					}
				}
				htmlContent.push(`</table>`);
				const html = htmlContent.join('');

				// Force the styles inline, via Juice, and store in our return value:
				returnVal.html = cssInliner(styles + html).trim();
				// And clobber the raw-ish data:
				delete returnVal.transcript;
			}


			if (config.storeLocation === 'context') {
				cognigy.context[contextKey] = returnVal;
			} else {
				cognigy.input[inputKey] = returnVal;
			}
		} catch (error) {

			if (config.storeLocation === 'context') {
				cognigy.context[contextKey] = error.message;
			} else {
				cognigy.input[inputKey] = error.message;
			}
		}

	}
});