/**
 * Interface extensions for properties that aren't included in
 * TypeScript's definitions by default, but that can be used.
 */

export {}

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
        skipWhile(predicate: (elem: T) => boolean): T[]
    }
}

Array.prototype.skipWhile = function<T>(this: T[], predicate: (elem: T) => boolean) {
    let i = 0;
    while(i < this.length && predicate(this[i])) {
        i++;
    }
    return this.slice(i);
}