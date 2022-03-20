import "mocha";
import {expect} from "chai";

import {PrefixLookupTree} from "../../../api/src/helpers/PrefixLookupTree";

describe("PrefixLookupTree", () => {
    it("should return exact match for a single value", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value");
        expect(sut.lookup("test")).to.equal("value");
    });

    it("should return prefix for a single value", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value");
        expect(sut.lookup("test string")).to.equal("value");
    });

    it("should return undefined if single value doesn't fully match", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value");
        expect(sut.lookup("tes")).to.be.undefined;
    });

    it("should return the longest exact match of two", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value1");
        sut.insert("test string", "value2");
        expect(sut.lookup("test string")).to.equal("value2");
    });

    it("should return the longest prefix of two", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value1");
        sut.insert("test string", "value2");
        expect(sut.lookup("test string test")).to.equal("value2");
    });

    it("should backtrack if a possible longer match doesn't fully match", () => {
        const sut = new PrefixLookupTree();
        sut.insert("test", "value1");
        sut.insert("test string", "value2");
        expect(sut.lookup("test strong")).to.equal("value1");
    });

    it("should still return the longest prefix when backtracking", () => {
        const sut = new PrefixLookupTree();
        sut.insert("t", "value1");
        sut.insert("test", "value2");
        sut.insert("test string", "value3");
        expect(sut.lookup("test strong")).to.equal("value2");
    });

    it("should return the longest prefix out of three fully distinct", () => {
        const sut = new PrefixLookupTree();
        sut.insert("one", "value1");
        sut.insert("two", "value2");
        sut.insert("four", "value4");
        expect(sut.lookup("two and a half")).to.equal("value2");
    });

    it("should return the longest prefix out of several overlapping", () => {
        const sut = new PrefixLookupTree();
        sut.insert("abc", "value1");
        sut.insert("abd", "value2");
        sut.insert("abcd", "value3");
        sut.insert("aa", "value4");
        sut.insert("abcde", "value5");

        expect(sut.lookup("a a")).to.be.undefined;
        expect(sut.lookup("abc def")).to.equal("value1");
        expect(sut.lookup("abdef")).to.equal("value2");
        expect(sut.lookup("abcd e")).to.equal("value3");
        expect(sut.lookup("aa b")).to.equal("value4");
        expect(sut.lookup("abcde f")).to.equal("value5");
    });
});
