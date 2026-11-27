/// <reference types="jest" />

import { prepareParams } from "../params";

describe("prepareParams", () => {
    it("preserves an array of strings", () => {
        expect(prepareParams(["a", "b"])).toEqual(["a", "b"]);
    });

    it("stringifies objects in an array, preserves strings", () => {
        expect(prepareParams([{ foo: "bar" }, "plain", { n: 1 }])).toEqual([
            '{"foo":"bar"}',
            "plain",
            '{"n":1}'
        ]);
    });

    it("parses a JSON-string array and stringifies non-string items", () => {
        expect(prepareParams('[{"a":1},"b"]')).toEqual(['{"a":1}', "b"]);
    });

    it("returns [] for a JSON string that parses into a non-array", () => {
        const warn = jest.fn();
        expect(prepareParams('{"a":1}', warn)).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
    });

    it("returns [] and logs warn for garbage string input", () => {
        const warn = jest.fn();
        expect(prepareParams("not json at all", warn, "testNode")).toEqual([]);
        expect(warn).toHaveBeenCalledWith(
            "warn",
            expect.stringContaining("testNode: Could not parse as JSON")
        );
    });

    it("returns [] for undefined/null/number inputs", () => {
        expect(prepareParams(undefined)).toEqual([]);
        expect(prepareParams(null)).toEqual([]);
        expect(prepareParams(42)).toEqual([]);
    });

    it("does not throw when no logger is supplied on parse failure", () => {
        expect(() => prepareParams("bad json")).not.toThrow();
        expect(prepareParams("bad json")).toEqual([]);
    });
});
