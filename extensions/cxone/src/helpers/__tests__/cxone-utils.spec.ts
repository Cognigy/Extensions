/// <reference types="jest" />

import { getToken, getCxoneOpenIdUrl, getCxoneConfigUrl, sendSignalHandover, sendSignal, postToTMS } from "../cxone-utils";

describe("cxone-utils helpers", () => {
  const api = {
    log: jest.fn(),
    addToContext: jest.fn()
  } as any;

  let context: any;

  beforeEach(() => {
    jest.useRealTimers();
    context = {};
    (global as any).fetch = jest.fn();
    api.log.mockReset();
    api.addToContext.mockReset();
  });

  describe("getToken", () => {
    const bToken = "basicToken";
    const username = "user";
    const password = "pass";
    const tokenUrl = "https://issuer/auth/token";

    it("requests new token and caches it in context", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      // First call populates cache
      const firstResponse = { access_token: "abc", id_token: "id1" };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => firstResponse
      });

      const first = await getToken(api, context, bToken, username, password, tokenUrl);
      expect(first).toEqual(firstResponse);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(api.addToContext).toHaveBeenCalledWith("cxoneEncryptedToken", expect.any(String), "simple");
      expect(api.addToContext).toHaveBeenCalledWith("cxoneTokenTimestamp", expect.any(Number), "simple");
    });

    it("refreshes when cached token is expired", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      context.cxoneEncryptedToken = "invalid:token";
      context.cxoneTokenTimestamp = Date.now() - 51 * 60 * 1000; // older than 50 minutes

      const fresh = { access_token: "new", id_token: "id2" };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => fresh
      });

      const result = await getToken(api, context, bToken, username, password, tokenUrl);
      expect(result).toEqual(fresh);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(api.addToContext).toHaveBeenCalledWith("cxoneEncryptedToken", expect.any(String), "simple");
      expect(api.addToContext).toHaveBeenCalledWith("cxoneTokenTimestamp", expect.any(Number), "simple");
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized"
      });

      await expect(
        getToken(api, context, bToken, username, password, tokenUrl)
      ).rejects.toThrow("CXone -> getToken: Error getting bearer token: 401: Unauthorized");
    });
  });

  describe("getCxoneOpenIdUrl", () => {
    it("returns cached URL from context", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      context.cxoneTokenUrl = "https://issuer/token";
      const result = await getCxoneOpenIdUrl(api, context, "https://issuer");
      expect(result).toBe("https://issuer/token");
      expect((global as any).fetch).not.toHaveBeenCalled();
    });

    it("discovers token endpoint via OpenID configuration", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ token_endpoint: "https://issuer/auth/token" })
      });
      const result = await getCxoneOpenIdUrl(api, context, "https://issuer");
      expect(result).toBe("https://issuer/auth/token");
      expect(fetchMock).toHaveBeenCalledWith("https://issuer/.well-known/openid-configuration");
      expect(api.addToContext).toHaveBeenCalledWith("cxoneTokenUrl", "https://issuer/auth/token", "simple");
    });

    it("throws if token_endpoint missing", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({})
      });
      await expect(
        getCxoneOpenIdUrl(api, context, "https://issuer")
      ).rejects.toThrow("CXone -> getCxoneOpenIdUrl: Token Endpoint URL not found in discovery response");
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error"
      });
      await expect(
        getCxoneOpenIdUrl(api, context, "https://issuer")
      ).rejects.toThrow("CXone -> getCxoneOpenIdUrl: Error getting token URL: 500: Server Error");
    });
  });

  describe("getCxoneConfigUrl", () => {
    it("returns cached API URL from context", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      context.cxoneApiUrl = "https://api/endpoint";
      const result = await getCxoneConfigUrl(api, context, "https://issuer", "tenant1");
      expect(result).toBe("https://api/endpoint");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("discovers API endpoint via configuration", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({ api_endpoint: "https://api/endpoint" })
      });
      const result = await getCxoneConfigUrl(api, context, "https://issuer", "tenant1");
      expect(result).toBe("https://api/endpoint");
      expect(fetchMock).toHaveBeenCalledWith("https://issuer/.well-known/cxone-configuration?tenantId=tenant1");
      expect(api.addToContext).toHaveBeenCalledWith("cxoneApiUrl", "https://api/endpoint", "simple");
    });

    it("throws if api_endpoint missing", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({})
      });
      await expect(
        getCxoneConfigUrl(api, context, "https://issuer", "tenant1")
      ).rejects.toThrow("CXone -> getCxoneConfigUrl: API endpoint not found in discovery response");
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found"
      });
      await expect(
        getCxoneConfigUrl(api, context, "https://issuer", "tenant1")
      ).rejects.toThrow("CXone -> getCxoneConfigUrl: Error getting endpoint URL: 404: Not Found");
    });
  });

  describe("sendSignalHandover", () => {
    it("posts correct body and headers", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 204,
        statusText: "No Content"
      });
      const status = await sendSignalHandover(api, "https://api", "tok", "contact 1", "End", ["a", "b"]);
      expect(status).toBe(204);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api/inContactAPI/services/v30.0/interactions/contact%201/signal?p1=End");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        Authorization: "Bearer tok",
        "Content-Type": "application/json"
      });
      expect(JSON.parse(options.body)).toEqual({ p2: "a", p3: "b" });
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request"
      });
      await expect(
        sendSignalHandover(api, "https://api", "tok", "c1", "End", [])
      ).rejects.toThrow("CXone -> sendSignalHandover: Error sending signal: 400: Bad Request");
    });
  });

  describe("sendSignal", () => {
    it("validates that signalParms has at least one element", async () => {
      await expect(
        sendSignal(api, "https://api", "tok", "c1", [])
      ).rejects.toThrow("CXone -> sendSignal: signalParms must include at least one parameter (p1)");
    });

    it("posts with correct query string and headers", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK"
      });
      const status = await sendSignal(api, "https://api", "tok", "contact 1", ["sig1", "sig two"]);
      expect(status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api/inContactAPI/services/v30.0/interactions/contact%201/signal?p1=sig1&p2=sig%20two");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({ Authorization: "Bearer tok" });
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error"
      });
      await expect(
        sendSignal(api, "https://api", "tok", "c1", ["p1"])
      ).rejects.toThrow("CXone -> sendSignal: Error sending signal: 500: Server Error");
    });
  });

  describe("postToTMS", () => {
    it("posts transcript payload", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: "Created"
      });
      const payload = { foo: "bar" };
      const status = await postToTMS(api, "https://api", "tok", payload);
      expect(status).toBe(201);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api/aai/tms/transcripts/post");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        Authorization: "Bearer tok",
        "Content-Type": "application/json"
      });
      expect(options.body).toBe(JSON.stringify(payload));
    });

    it("throws on HTTP error", async () => {
      const fetchMock = (global as any).fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: "Service Unavailable"
      });
      await expect(
        postToTMS(api, "https://api", "tok", {})
      ).rejects.toThrow("CXone -> postToTMS: Error posting to TMS: 503: Service Unavailable");
    });
  });
});


