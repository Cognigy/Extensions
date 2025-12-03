/// <reference types="jest" />

import { sendSignalToCXone } from "../send-signal";
import { createMockCognigy } from "../../test-utils/mockCognigyApi";

jest.mock("../../helpers/cxone-utils", () => ({
  getToken: jest.fn().mockResolvedValue({ access_token: "tok", id_token: "idTok" }),
  getCxoneOpenIdUrl: jest.fn().mockResolvedValue("https://issuer/auth/token"),
  getCxoneConfigUrl: jest.fn().mockResolvedValue("https://api"),
  sendSignal: jest.fn().mockResolvedValue(204)
}));

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn().mockReturnValue({ iss: "https://issuer", tenantId: "tenant1" })
}));

const helpers = require("../../helpers/cxone-utils");

describe("sendSignalToCXone node", () => {
  const baseConfig = {
    environment: "https://cxone.niceincontact.com",
    baseUrl: "",
    contactId: "12345",
    signalParams: ["one", "two"],
    connection: {
      accessKeyId: "ak",
      accessKeySecret: "as",
      clientId: "cid",
      clientSecret: "cs"
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signals CXone for voice channel", async () => {
    const cognigy = createMockCognigy({
      input: { channel: "voice" }
    });

    await sendSignalToCXone.function({
      cognigy,
      config: baseConfig as any
    } as any);

    expect(helpers.getCxoneOpenIdUrl).toHaveBeenCalledWith(
      cognigy.api,
      cognigy.context,
      baseConfig.environment
    );
    expect(helpers.getToken).toHaveBeenCalled();
    expect(helpers.getCxoneConfigUrl).toHaveBeenCalled();
    expect(helpers.sendSignal).toHaveBeenCalledWith(
      cognigy.api,
      "https://api",
      "tok",
      baseConfig.contactId,
      baseConfig.signalParams
    );
    expect(cognigy.api.addToContext).toHaveBeenCalledWith(
      "CXoneSendSignal",
      expect.stringContaining("CXone was Signaled"),
      "simple"
    );
    // Output for chat channel is always emitted
    expect(cognigy.api.output).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        Intent: "Signal",
        Params: "one|two"
      })
    );
  });

  it("uses trimmed baseUrl when environment is other", async () => {
    const cognigy = createMockCognigy({
      input: { channel: "voice" }
    });

    await sendSignalToCXone.function({
      cognigy,
      config: { ...baseConfig, environment: "other", baseUrl: "https://issuer///" } as any
    } as any);

    expect(helpers.getCxoneOpenIdUrl).toHaveBeenCalledWith(
      cognigy.api,
      cognigy.context,
      "https://issuer"
    );
  });

  it("does not call sendSignal when contactId missing", async () => {
    const cognigy = createMockCognigy({
      input: { channel: "voice" }
    });

    await sendSignalToCXone.function({
      cognigy,
      config: { ...baseConfig, contactId: "" } as any
    } as any);

    expect(helpers.sendSignal).not.toHaveBeenCalled();
    expect(cognigy.api.output).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ Intent: "Signal" })
    );
  });

  it("handles errors from helpers and surfaces context and output", async () => {
    (helpers.sendSignal as jest.Mock).mockRejectedValueOnce(new Error("send error"));

    const cognigy = createMockCognigy({
      input: { channel: "voice" }
    });

    await expect(
      sendSignalToCXone.function({
        cognigy,
        config: baseConfig as any
      } as any)
    ).rejects.toThrow("send error");

    expect(cognigy.api.log).toHaveBeenCalledWith(
      "error",
      expect.stringContaining("sendSignalToCXone: Error signaling")
    );
    expect(cognigy.api.addToContext).toHaveBeenCalledWith(
      "CXoneSendSignal",
      expect.stringContaining("Error signaling"),
      "simple"
    );
    expect(cognigy.api.output).toHaveBeenCalledWith(
      "Something is not working. Please retry.",
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});


