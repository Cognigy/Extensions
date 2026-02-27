/// <reference types="jest" />

import { CXoneApiClient } from "../cxone-api-client";
import { CXoneConnection, CognigyContext } from "../../types";
import { TokenManager } from "../../helpers/token-manager";

jest.mock("../../helpers/token-manager");

describe("CXoneApiClient", () => {
    let api: any;
    let context: CognigyContext;
    let connection: CXoneConnection;
    let client: CXoneApiClient;
    let fetchMock: jest.Mock;

    beforeEach(() => {
        jest.useRealTimers();
        api = {
            log: jest.fn(),
            addToContext: jest.fn()
        };
        context = {};
        connection = {
            environmentUrl: "https://cxone.niceincontact.com",
            accessKeyId: "ak",
            accessKeySecret: "as",
            clientId: "cid",
            clientSecret: "cs"
        };
        client = new CXoneApiClient(api, context, connection);
        fetchMock = jest.fn();
        (global as any).fetch = fetchMock;
        // Mock TokenManager methods
        (TokenManager.encryptToken as jest.Mock) = jest.fn().mockReturnValue("encrypted:token");
        (TokenManager.decryptToken as jest.Mock) = jest.fn().mockReturnValue('{"access_token":"abc","id_token":"id1"}');
    });

    describe("getToken", () => {
        it("requests new token and caches it in context", async () => {
            const tokenResponse = { access_token: "abc", id_token: "id1" };
            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: "OK",
                json: async () => tokenResponse
            });

            // Mock getOpenIdConfig to return a URL
            jest.spyOn(client as any, "getOpenIdConfig").mockResolvedValue("https://issuer/auth/token");

            const result = await client.getToken();
            expect(result).toEqual(tokenResponse);
            expect(api.addToContext).toHaveBeenCalledWith("cxoneEncryptedToken", expect.any(String), "simple");
            expect(api.addToContext).toHaveBeenCalledWith("cxoneTokenTimestamp", expect.any(Number), "simple");
        });

        it("uses cached token if available and fresh", async () => {
            const tokenResponse = { access_token: "abc", id_token: "id1" };
            const encryptedToken = "encrypted:token";
            context.cxoneEncryptedToken = encryptedToken;
            context.cxoneTokenTimestamp = Date.now() - 30 * 60 * 1000; // 30 minutes ago

            (TokenManager.decryptToken as jest.Mock).mockReturnValueOnce(JSON.stringify(tokenResponse));

            const result = await client.getToken();
            expect(result).toEqual(tokenResponse);
            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe("sendSignal", () => {
        it("sends signal with correct parameters", async () => {
            jest.spyOn(client as any, "getToken").mockResolvedValue({
                access_token: "token",
                id_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lzc3VlciIsInRlbmFudElkIjoidGVuYW50MSJ9.signature"
            });
            jest.spyOn(client as any, "getApiEndpoint").mockResolvedValue("https://api");

            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 204,
                statusText: "No Content"
            });

            const status = await client.sendSignal("contact1", ["param1", "param2"]);
            expect(status).toBe(204);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining("p1=param1&p2=param2"),
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        Authorization: "Bearer token"
                    })
                })
            );
        });

        it("throws error if signalParams is empty", async () => {
            await expect(client.sendSignal("contact1", [])).rejects.toThrow(
                "signalParams must include at least one parameter"
            );
        });
    });

    describe("sendSignalHandover", () => {
        it("sends handover signal with correct parameters", async () => {
            jest.spyOn(client as any, "getToken").mockResolvedValue({
                access_token: "token",
                id_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lzc3VlciIsInRlbmFudElkIjoidGVuYW50MSJ9.signature"
            });
            jest.spyOn(client as any, "getApiEndpoint").mockResolvedValue("https://api");

            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 204,
                statusText: "No Content"
            });

            const status = await client.sendSignalHandover("contact1", "End", ["param1"]);
            expect(status).toBe(204);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining("p1=End"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ p2: "param1" })
                })
            );
        });
    });

    describe("postTranscript", () => {
        it("posts transcript to TMS", async () => {
            jest.spyOn(client as any, "getToken").mockResolvedValue({
                access_token: "token",
                id_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2lzc3VlciIsInRlbmFudElkIjoidGVuYW50MSJ9.signature"
            });
            jest.spyOn(client as any, "getApiEndpoint").mockResolvedValue("https://api");

            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 201,
                statusText: "Created"
            });

            const payload = { transcript: "data" };
            const status = await client.postTranscript(payload);
            expect(status).toBe(201);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining("/aai/tms/transcripts/post"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify(payload)
                })
            );
        });
    });
});

