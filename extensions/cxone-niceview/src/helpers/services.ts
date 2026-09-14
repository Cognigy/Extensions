export const getNiCEviewData = async (api: any, userToken: string, settingName: string, useLastSaved: boolean) => {
    try {
        const SERVICE_URL = 'https://lxtkt6ckz5izmhi5kx3ryn7a7a0ddfpy.lambda-url.us-west-2.on.aws';
        const procName = useLastSaved ? 'getCurrentSettingByToken' : 'getSettingReadOnly';
        const url = `${SERVICE_URL}?proc=${procName}`;
        const params = useLastSaved ? [userToken.trim()] : [userToken.trim(), settingName.trim()];
        const requestBody = { params };
        const response = await fetch(url, {
            method: 'POST',
            /*
            headers: {
                'Content-Type': 'application/json',
            },
            */
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`NiCEview -> getNiCEviewData: HTTP error fetching demo settings! Status: ${response.status}`);
        }

        // the service can answer with a non-JSON error page (e.g. a gateway error) - say so clearly
        // instead of failing with "Unexpected token <"
        const responseText = await response.text();
        let data: any;
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(`NiCEview -> getNiCEviewData: the service returned a non-JSON response (${response.status}): ${responseText.slice(0, 200)}`);
        }

        if (data && data.data && data.data.length > 0) {
            const settings = data.data[0];
            const smallSettings = { ...settings };
            delete smallSettings.guideStyles;
            delete smallSettings.chatStyles;
            delete smallSettings.cognigyChatStyles;
            api.log("info", `NiCEview -> getNiCEviewData: demo settings (truncated): ${JSON.stringify(smallSettings)}`);
            return settings;
        } else {
             api.log("info", "NiCEview -> getNiCEviewData: No demo settings data available");
            return {};
        }
    } catch (error) {
         api.log("error", `NiCEview -> getNiCEviewData: Error fetching demo settings: ${error.message}`);
        throw error;
    }
};