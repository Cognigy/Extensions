import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const NewsAPI = require('newsapi');

export interface IGetNewsHeadlines extends INodeFunctionBaseParams {
    config: {
        connection: {
            key: string;
        };
        query: string;
        country: string;
        language: string;
        stopOnError: boolean;
        site: string;
        category: string;
        contextStore: string;
    };
}
export const getNewsHeadlines = createNodeDescriptor({
    type: "getNewsHeadlines",
    defaultLabel: "Get News Headlines",
    preview: {
        key: "query",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "The provided api-key",
            type: "connection",
            params: {
                connectionType: "api-key",
                required: true
            }
        },
        {
            key: "stopOnError",
            label: "Whether to stop on error or continue",
            type: "toggle",
            defaultValue: false,
        },
        {
            key: "query",
            label: "The search query",
            type: "cognigyText",
            params: {
                required: true,
            },
        },
        {
            key: "country",
            label: "The news country (e.g. de (Germany), us (USA))",
            type: "select",
            defaultValue: "us",
            params: {
                required: true,
                options: [
                    { label: "ae", value: "ae" }, { label: "ar", value: "ar" }, { label: "at", value: "at" }, { label: "au", value: "au" }, { label: "be", value: "be" }, { label: "bg", value: "bg" }, { label: "br", value: "br" }, { label: "ca", value: "ca" }, { label: "ch", value: "ch" }, { label: "cn", value: "cn" }, { label: "co", value: "co" }, { label: "cu", value: "cu" }, { label: "cz", value: "cz" }, { label: "de", value: "de" }, { label: "eg", value: "eg" }, { label: "fr", value: "fr" }, { label: "gb", value: "gb" }, { label: "gr", value: "gr" }, { label: "hk", value: "hk" }, { label: "hu", value: "hu" }, { label: "id", value: "id" }, { label: "ie", value: "ie" }, { label: "il", value: "il" }, { label: "in", value: "in" }, { label: "it", value: "it" }, { label: "jp", value: "jp" }, { label: "kr", value: "kr" }, { label: "lt", value: "lt" }, { label: "lv", value: "lv" }, { label: "ma", value: "ma" }, { label: "mx", value: "mx" }, { label: "my", value: "my" }, { label: "ng", value: "ng" }, { label: "nl", value: "nl" }, { label: "no", value: "no" }, { label: "nz", value: "nz" }, { label: "ph", value: "ph" }, { label: "pl", value: "pl" }, { label: "pt", value: "pt" }, { label: "ro", value: "ro" }, { label: "rs", value: "rs" }, { label: "ru", value: "ru" }, { label: "sa", value: "sa" }, { label: "se", value: "se" }, { label: "sg", value: "sg" }, { label: "si", value: "si" }, { label: "sk", value: "sk" }, { label: "th", value: "th" }, { label: "tr", value: "tr" }, { label: "tw", value: "tw" }, { label: "ua", value: "ua" }, { label: "us", value: "us" }, { label: "ve", value: "ve" }, { label: "za", value: "za" }
                ]
            }
        },
        {
            key: "language",
            type: "select",
            label: "News language",
            defaultValue: "en",
            params: {
                required: true,
                options: [
                    {
                        label: "English",
                        value: "en",
                    },
                    {
                        label: "German",
                        value: "de",
                    },
                ],
            },
        },
        {
            key: "site",
            label: "The news site",
            type: "select",
            params: {
                required: true,
                options: [{ label: "bbc-news", value: "bbc-news" }, { label: "the-verge", value: "the-verge" }, { label: "cbs-news", value: "cbs-news" }, { label: "abc-news", value: "abc-news" }, { label: "bild", value: "bild" }, { label: "cnn", value: "cnn" }, { label: "der-tagesspiegel", value: "der-tagesspiegel" }, { label: "focus", value: "focus" }, { label: "fox-news", value: "fox-news" }, { label: "t3n", value: "t3n" }, { label: "marca", value: "marca" }, { label: "the-telegraph", value: "the-telegraph" }, { label: "wired", value: "wired" }, { label: "the-wall-street-journal", value: "the-wall-street-journal" }, { label: "spiegel-online", value: "spiegel-online" }, { label: "the-washington-times", value: "the-washington-times" }, { label: "the-new-york-times", value: "the-new-york-times" }, { label: "die-zeit", value: "die-zeit" }, { label: "la-repubblica", value: "la-repubblica" }, { label: "nhl-news", value: "nhl-news" }, { label: "espn", value: "espn" }],
            }
        },
        {
            key: "category",
            label: "The news category",
            type: "select",
            defaultValue: "general",
            params: {
                required: true,
                options: [{ label: "general", value: "general" }, { label: "business", value: "business" }, { label: "technology", value: "technology" }, { label: "entertainment", value: "entertainment" }, { label: "health", value: "health" }, { label: "science", value: "science" }, { label: "sports", value: "sports" }],
            }
        },
        {
            key: "contextStore",
            label: "Context key to store Result",
            type: "cognigyText",
            defaultValue: "news",
            params: {
                required: true
            },
        },
    ],
    sections: [
        {
            key: "contextSection",
            label: "Storage Options",
            defaultCollapsed: true,
            fields: [
                "contextStore",
            ]
        },
        {
            key: "stopSection",
            label: "additional settings",
            defaultCollapsed: true,
            fields: [
                "stopOnError",
            ]
        },
        {
            key: "connectionSection",
            label: "Authentication",
            defaultCollapsed: false,
            fields: [
                "connection",
            ]
        }
    ],
    form: [
        { type: "field", key: "query" },
        { type: "field", key: "country" },
        { type: "field", key: "site" },
        { type: "field", key: "category" },
        { type: "section", key: "contextSection" },
        { type: "section", key: "connectionSection" },
        { type: "section", key: "stopSection" },
    ],
    appearance: {
        color: "#000000"
    },
    function: async ({ cognigy, config }: IGetNewsHeadlines) => {
        const { api } = cognigy;
        const { query, country, site, category, language, stopOnError, contextStore, connection } = config;

        try {
            if (!connection.key) return Promise.reject("The secret is missing the 'apiKey' field.");
            if (!contextStore) return Promise.reject("No context store key defined.");

            const key = connection.key;
            const newsapi = new NewsAPI(key);

            const response = await newsapi.v2.topHeadlines({
                site,
                q: query,
                category,
                language,
                country
            });

            api.addToContext(contextStore, response, 'simple');
        } catch (error) {
            if (stopOnError) {
                throw new Error(error.message);
            } else {
                api.addToContext(contextStore, { error: error.message }, 'simple');
            }
        }
    }
});