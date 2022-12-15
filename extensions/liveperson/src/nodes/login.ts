import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ILoginParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            username: string;
            appKey: string;
            secret: string;
            accountId: string;
            accessToken: string;
            accessTokenSecret: string;
        }
    };
}
export const loginNode = createNodeDescriptor({
    type: "login",
    defaultLabel: {
        default: "Login",
        deDE: "Login"
    },
    summary: {
        default: "Retrieves login credentials for Liveperson",
        deDE: "Beantragt Login Daten für Liveperson"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Liveperson Connection OnShift API",
                deDE: "Liveperson Verbindung OnShift API",
            },
            type: "connection",
            params: {
                connectionType: "liveperson",
                required: true
            }
        },
    ],
    form: [
        { type: "field", key: "connection" },
    ],
    tokens: [
        { type: "context", script: "context.livepersonBearerToken", label: "Liveperson Bearer Token"}
    ],
    appearance: {
        color: "orange"
    },
    function: async ({ cognigy, config }: ILoginParams) => {
        const { api, context } = cognigy;
        const { connection } = config;
        const { username, appKey, secret, accessToken, accountId, accessTokenSecret } = connection;

        try {
            if (!context.livepersonBearerToken) {
                const authResponse = await axios({
                    method: "post",
                    url: `https://lo.agentvep.liveperson.net/api/account/${accountId}/login?v=1.3`,
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    data: {
                        username,
                        appKey,
                        secret,
                        accessToken,
                        accessTokenSecret
                    }
                });
                context["livepersonBearerToken"] = authResponse?.data?.bearer;
            } else {
                api.log("debug", "[Liveperson] Login token already set, no need to retrieve");
            }

        } catch (error) {

            api.log("error", `[Liveperson] Unable to authorize. Error was: ${JSON.stringify(error)}`);
        }
    }
});