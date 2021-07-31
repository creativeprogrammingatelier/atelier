/**
 * Interface extensions for properties that aren't included in
 * TypeScript's definitions by default, but that can be used.
 */

export {};

declare global {
	// Filepath when using folder upload
	interface File {
		webkitRelativePath: string
	}
	
	// Attribute to enable folder upload
	interface HTMLInputElement {
		webkitdirectory: boolean
	}
	
	interface Array<T> {
		/**
		 * Iterate over the array, skipping elements until one matches the predicate. When an
		 * item matches the predicate, that item and the rest of the array are returned. If
		 * there are no matching elements, the result is an empty array.
		 * @param predicate function that decides if the element should be skipped
		 */
		skipWhile(predicate: (elem: T) => boolean): T[]
	}
}

Array.prototype.skipWhile = function <T>(this: T[], predicate: (elem: T) => boolean) {
    let i = 0;
    while (i < this.length && predicate(this[i])) {
        i++;
    }
    return this.slice(i);
};