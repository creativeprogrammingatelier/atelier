import 'mocha';
import { expect } from 'chai';
import { repeatIt, randomNumberArray, randomBool, TEST_COUNT } from '../QuickCheck';

import '../../helpers/Extensions';

describe("Array.skipWhile", () => {
    repeatIt("should give no results if predicate is false", () => {
        const array = randomNumberArray(TEST_COUNT);
        expect(array.skipWhile(x => false)).to.deep.equal(array);
    });

    repeatIt("should give an empty array if predicate is true", () => {
        const array = randomNumberArray(TEST_COUNT);
        expect(array.skipWhile(x => true)).to.deep.equal([]);
    });

    repeatIt("should give a slice of the array", () => {
        const array = randomNumberArray(TEST_COUNT);
        const skipped = array.skipWhile(x => randomBool());
        expect(skipped).to.deep.equal(array.slice(array.length - skipped.length));
    });

    it("should give the expected results", () => {
        expect([1, 2, 3, 4, 5, 6].skipWhile(x => x < 4)).to.deep.equal([4, 5, 6]);
        expect([1, 2, 3, 4, 5, 6].skipWhile(x => x < 0)).to.deep.equal([1, 2, 3, 4, 5, 6]);
        expect([1, 2, 3, 4, 5, 6].skipWhile(x => x < 7)).to.deep.equal([]);
        expect([0, 0, 1, 0, 1].skipWhile(x => x === 0)).to.deep.equal([1, 0, 1]);
        expect([0, 0, 1, 0, 1].skipWhile(x => x === 1)).to.deep.equal([0, 0, 1, 0, 1]);
    });
});