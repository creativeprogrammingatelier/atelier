/**
 * Object for returning the name of a file.
 */
export class FileNameHelper {
    /**
	 * Method extracting the name of a file from a file path.
	 * 
	 * @param path Path to file.
	 * @returns String representation of the name of the file.
	 */
    static fromPath(path: string) {
        const parts = path.split("/");
        return parts[parts.length - 1];
    }
}