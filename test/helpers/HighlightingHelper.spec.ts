import 'mocha';
import {expect} from 'chai';
import {before, Range, getRanges, rangesToString} from "../../client/src/helpers/HighlightingHelper";

/**
 * Create a Range object
 */
function r(a: number, b: number, c: number, d: number, e: number) {
    return {
        startLine: a,
        startChar: b,
        endLine: c,
        endChar: d,
        overlap: e
    }
}

/** Takes an array of ranges and checks
 * whether they are properly disjoint
 * at the end
 */
function testSplit(a: Range[]) {
    const result: Range[] = getRanges(a);

    // Just manually checking if overlaps are properly detected
    // Bit too much time to write a test for this, and its easy
    // for humans to see
    const s1 = rangesToString(a).split('\n').join('\n\t');
    console.log('\t' + s1);
    console.log('\t' + "-");
    const s2 = rangesToString(result).split('\n').join('\n\t');
    console.log('\t' + s2);
    console.log("\t----- /// -----");

    // Check whether resulting segments are indeed disjoint
    for (const [indexA, rangeA] of result.entries()) {
        for (const [indexB, rangeB] of result.entries()) {
            if (indexA !== indexB) {
                const disjoint = before(rangeA, rangeB) || before(rangeB, rangeA);
                expect(disjoint, rangesToString(result)).to.equal(true);
            }
        }
    }
}

const ranges: Range[] = [];
ranges.push(r(0, 0, 0, 3, 1)); // 0
ranges.push(r(0, 2, 0, 5, 1)); // 1
ranges.push(r(0, 6, 0, 7, 1)); // 2
ranges.push(r(0, 8, 0, 9, 1)); // 3
ranges.push(r(1, 0, 1, 3, 1)); // 4
ranges.push(r(1, 0, 1, 4, 1)); // 5
ranges.push(r(1, 6, 1, 9, 1)); // 6
ranges.push(r(1, 7, 1, 8, 1)); // 7
ranges.push(r(2, 0, 2, 3, 1)); // 8
ranges.push(r(2, 1, 2, 4, 1)); // 9
ranges.push(r(2, 6, 3, 3, 1)); // 10
ranges.push(r(3, 1, 3, 5, 1)); // 11
ranges.push(r(3, 3, 3, 7, 1)); // 12
ranges.push(r(3, 6, 3, 8, 1)); // 13
ranges.push(r(3, 6, 3, 9, 1)); // 14
ranges.push(r(4, 0, 4, 3, 1)); // 15
ranges.push(r(4, 0, 4, 4, 1)); // 16
ranges.push(r(4, 1, 4, 3, 1)); // 17
ranges.push(r(4, 6, 5, 1, 1)); // 18
ranges.push(r(4, 7, 5, 2, 1)); // 19
ranges.push(r(5, 4, 5, 7, 1)); // 20

describe("Checks whether the split is indeed disjoint. Edges cases for overlap checked manually (text) and in the front end.", () => {
    // Base cases
    testSplit(ranges.slice(0, 2));
    testSplit(ranges.slice(2, 4));
    testSplit(ranges.slice(4, 6));
    testSplit(ranges.slice(6, 8));
    testSplit(ranges.slice(8, 10));
    testSplit(ranges.slice(10, 13));

    // Combined large case
    testSplit(ranges);
});