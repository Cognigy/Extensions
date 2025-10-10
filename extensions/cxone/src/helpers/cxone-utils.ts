// Function to get bearer token
export const getToken = async (bToken: string, uValue: string, pValue: string, tokenUrl: string) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": "Basic " + bToken
  };
  const body = new URLSearchParams({ grant_type: "password", username: uValue, password: pValue });
  const response = await fetch(tokenUrl, { method: "POST", headers, body });
  if (!response.ok) {
    throw new Error(`sendSignalToCXone -> getToken: Error getting bearer token: ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};

// Function to get token URL via discovery service
export const getCxoneOpenIdUrl = async (issuer: string) => {
    const url = `${issuer}/.well-known/openid-configuration`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> getCxoneOpenIdUrl: Error getting token URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.token_endpoint) {
        throw new Error(`sendSignalToCXone -> getCxoneOpenIdUrl: Token Endpoint URL not found in discovery response`);
    }
    return data.token_endpoint;
};

// Function to get API endpoint via discovery service
export const getCxoneConfigUrl = async (issuer: string, tenant: string) => {
    const url = `${issuer}/.well-known/cxone-configuration?tenantId=${tenant}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> getCxoneConfigUrl: Error getting endpoint URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.api_endpoint) {
        throw new Error(`sendSignalToCXone -> getCxoneConfigUrl: API endpoint not found in discovery response`);
    }
    return data.api_endpoint;
};

// Function to handover action to CXone
export const sendSignalHandover = async (api: any, apiEndpointUrl: string, token: string, contactId: string, action: string, otherParms: any[] = []) => {
    let url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?p1=${encodeURIComponent(action)}`;
    otherParms.forEach((val, index) => url += `&p${index + 2}=${encodeURIComponent(val)}`);
    api.log("info", `sendSignalToCXone -> sendSignalHandover: About to signal to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> sendSignalHandover: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to send signal to CXone
export const sendSignal = async (api: any, apiEndpointUrl: string, token: string, contactId: string, signalParms: any[] = []) => {
    if (!Array.isArray(signalParms) || signalParms.length === 0)
        throw new Error("sendSignalToCXone -> sendSignal: signalParms must include at least one parameter (p1)");

    const queryString = signalParms
        .map((val, index) => `p${index + 1}=${encodeURIComponent(val)}`)
        .join("&");

    const url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?${queryString}`;

    api.log("info", `sendSignal -> About to signal to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
        throw new Error(`sendSignalToCXone -> sendSignal: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to post transcript to TMS
export const postToTMS = async (api: any, apiEndpointUrl: string, token: string, tmsPayload: any) => {
    const url = `${apiEndpointUrl}/aai/tms/transcripts/post`;
    api.log("info", `sendSignalToCXone -> postToTMS: About to post to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(tmsPayload) });
    if (!response.ok) {
        throw new Error(`Error posting to TMS: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};