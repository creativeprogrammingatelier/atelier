export class FileNameHelper {
    static fromPath(path: string) {
        const parts = path.split("/");
        return parts[parts.length - 1];
    }
}