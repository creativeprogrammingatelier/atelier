import {Position, Selection} from "../../../models/api/Snippet";

export class SelectionHelper {
	/**
	 * Compares two snippets' regions to see which one would have priority
	 * if both were clicked.
	 *
	 * @param a: Selection 1
	 * @param b: Selection 2
	 * @returns boolean: Whether selection a has priority over selection b
	 */
	static priority(a?: Selection, b?: Selection) {
		if (a === undefined) {
			return false;
		} else if (b === undefined) {
			return true;
		} else if (SelectionHelper.contains(a, b)) {
			// If b is fully contained by a, clicking on b is more important
			return false;
		} else if (SelectionHelper.contains(b, a)) {
			// If a is fully contained by b, clicking on a is more important
			return true;
		} else if (SelectionHelper.before(a, b)) {
			// If a starts before b, give a priority
			return true;
		} else if (SelectionHelper.after(a, b)) {
			// If a ends after b, give b priority
			return false;
		} else {
			// In the case of a click in the overlap, the only remaining
			// case is equal selections, so return that.
			return SelectionHelper.equals(a, b);
		}
	}

	/**
	 * Checks if one selection contains another
	 *
	 * @param a: Selection 1
	 * @param b: Selection 2
	 * @returns boolean: Whether selection a contains selection b
	 */
	static contains(a: Selection, b: Selection) {
		return SelectionHelper.before(a, b) && SelectionHelper.after(a, b);
	}

	/**
	 * Checks if two selections are the same
	 *
	 * @param a: Selection 1
	 * @param b: Selection 2
	 * @returns boolean: Whether selection a and selection b are the same
	 */
	static equals(a: Selection, b: Selection) {
		return a.start.line === b.start.line && a.start.character === b.start.character && a.end.line === b.end.line && a.end.character === b.end.character;
	}

	/**
	 * Checks if one selection starts before another
	 *
	 * @param a: Selection 1
	 * @param b: Selection 2
	 * @returns boolean: Whether selection a starts before selection b
	 */
	static before(a: Selection, b: Selection) {
		return a.start.line < b.start.line || (a.start.line === b.start.line && a.start.character < b.start.character);
	}

	/**
	 * Checks if one selection ends after another
	 *
	 * @param a: Selection 1
	 * @param b: Selection 2
	 * @returns boolean: Whether selection a ends after selection b
	 */
	static after(a: Selection, b: Selection) {
		return a.end.line > b.end.line || (a.end.line === b.end.line && a.end.character > b.end.character);
	}

	/**
	 * Checks if the position is inside the selection
	 *
	 * @param a: Selection
	 * @param b: Position
	 * @returns boolean: Whether the position is inside the selection
	 */
	static in(a: Selection, b: Position) {
		return a.start.line <= b.line && a.end.line >= b.line && a.start.character <= b.character && a.end.character >= b.character;
	}
}