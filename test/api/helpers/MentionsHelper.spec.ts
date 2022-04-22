import {expect} from "chai";
import "mocha";

import * as MentionsHelper from "../../../api/src/helpers/MentionsHelper";

describe("MentionsHelper", () => {
    describe("getPossibleMentions", () => {
        const sut = MentionsHelper.getPossibleMentions;

        it("should give no mentions for an empty string", () =>
            expect(sut("")).to.be.empty
        );
        it("should give correct mentions for a comment with an end mention", () =>
            expect(sut("Test comment @Test Person Name")).to.deep.equal(
                ["Test Person Name"]
            )
        );
        it("should give correct mentions for a comment with a begin mention", () =>
            expect(sut("@Test Person Name This is a comment")).to.deep.equal(
                ["Test Person Name This is a comment"]
            )
        );
        it("should give correct mentions for a comment with multiple end mentions", () =>
            expect(sut("Test comment for @Test Person @Someone else @The other one")).to.deep.equal(
                ["Test Person", "Someone else", "The other one"]
            )
        );
        it("should give correct mentions for a comment with multiple begin mentions", () => {
            expect(sut("@Test Person @Someone else @The other one This is a comment for you")).to.deep.equal(
                ["Test Person", "Someone else", "The other one This is a comment for you"]
            );
        });
    });
});
