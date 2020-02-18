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
}