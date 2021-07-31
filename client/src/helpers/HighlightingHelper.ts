import FastPriorityQueue = require("fastpriorityqueue");

const DEBUGGING = false;

export interface Range {
    startLine: number,
    endLine: number,
    startChar: number,
    endChar: number,
    overlap: number
}

/**
 * Range to string
 */
export function rangeToString(a: Range) {
    return `${a.startLine}:${a.startChar}-${a.endLine}:${a.endChar}  ${a.overlap}`;
}

/**
 * Ranges to string
 */
export function rangesToString(a: Range[]) {
    return a.map(rangeToString).join("\n");
}

/**
 * Compare function to sort ranges.
 * First it sorts on start position. If two ranges
 * start at the same location the smaller range
 * comes first, ie. the one that ends first.
 */
const rangeSort: (a: Range, b: Range) => boolean = (a: Range, b: Range) => {
    if (a.startLine !== b.startLine) {
        return a.startLine < b.startLine;
    }
    if (a.startChar !== b.startChar) {
        return a.startChar < b.startChar;
    }
    if (a.endLine !== b.endLine) {
        return a.endLine < b.endLine;
    }
    return a.endChar < b.endChar;
};

/**
 * Check whether range is before another
 * range. They ranges should also be disjoint.
 */
export const before: (a: Range, b: Range) => boolean = (a: Range, b: Range) => {
    if (a.endLine !== b.startLine) {
        return a.endLine < b.startLine;
    }
    return a.endChar <= b.startChar;
};

/**
 * Checks whether two ranges start at the
 * same position.
 */
const equalStart: (a: Range, b: Range) => boolean = (a: Range, b: Range) =>
    a.startLine === b.startLine && a.startChar === b.startChar;

/**
 * Determine whether a range is non empty
 */
const nonEmptyRange: (a: Range) => boolean = (a: Range) =>
    a.startLine !== a.endLine || a.startChar !== a.endChar;

/**
 * Return a set of non overlapping ranges from a
 * certain set of input ranges. Keeps track of how
 * many input ranges share a resulting range.
 *
 * @param ranges, input ranges that can overlap
 */
export function getRanges(ranges: Range[]) {
    const q = new FastPriorityQueue(rangeSort);

    for (const range of ranges.entries()) {
        q.add(range[1]);
    }

    const result: Range[] = [];

    while (!q.isEmpty()) {
        // Get next range
        const currentRange: Range = q.poll() as Range;
        if (DEBUGGING) {
            console.log("Current: " + rangeToString(currentRange));
        }

        // If no ranges left, there will be not overlap
        if (q.isEmpty()) {
            result.push(currentRange);
            continue;
        }

        // Get the next range
        const nextRange: Range = q.poll() as Range;
        if (DEBUGGING) {
            console.log("Next: " + rangeToString(nextRange));
        }

        // If current range ends before the next range it can be added to the result
        if (before(currentRange, nextRange)) {
            if (DEBUGGING) {
                console.log("CASE: before");
            }
            result.push(currentRange);
            q.add(nextRange);
            continue;
        }

        // If they start at the same point, we cut it off where the current range ends
        if (equalStart(currentRange, nextRange)) {

            // Add overlap to the queue, and adjust the overlapping segments
            const overlapRange = {
                startLine: currentRange.startLine,
                startChar: currentRange.startChar,
                endLine: currentRange.endLine,
                endChar: currentRange.endChar,
                overlap: currentRange.overlap + nextRange.overlap
            };
            const additionalRange = {
                startLine: currentRange.endLine,
                startChar: currentRange.endChar,
                endLine: nextRange.endLine,
                endChar: nextRange.endChar,
                overlap: nextRange.overlap
            };
            if (DEBUGGING) {
                console.log("CASE: equal start");
                console.log(rangeToString(overlapRange));
                console.log(rangeToString(additionalRange));
            }

            q.add(overlapRange);
            q.add(additionalRange);
            continue;
        }

        // If they don't start at the same point, we cut if off where the next range starts
        const beforeNextRange: Range = {
            startLine: currentRange.startLine,
            startChar: currentRange.startChar,
            endLine: nextRange.startLine,
            endChar: nextRange.startChar,
            overlap: currentRange.overlap
        };
        const additionalCurrentRange: Range = {
            startLine: nextRange.startLine,
            startChar: nextRange.startChar,
            endLine: currentRange.endLine,
            endChar: currentRange.endChar,
            overlap: currentRange.overlap
        };
        const additionalNextRange: Range = {
            startLine: nextRange.startLine,
            startChar: nextRange.startChar,
            endLine: nextRange.endLine,
            endChar: nextRange.endChar,
            overlap: nextRange.overlap
        };

        if (DEBUGGING) {
            console.log("CASE: unequal start");
            console.log(rangeToString(beforeNextRange));
            console.log(rangeToString(additionalCurrentRange));
            console.log(rangeToString(additionalNextRange));
        }

        q.add(beforeNextRange);
        q.add(additionalCurrentRange);
        q.add(additionalNextRange);
    }

    return result.filter(nonEmptyRange);
}

