import path from 'path';
import { config } from './ConfigurationHelper';

/** Determine the correct file type based on supplied MIME type and the file extension */
export function getProperType(mimeType: string, filePath: string) {
    if (mimeType === "application/octet-stream" || mimeType === "text/plain") {
        switch (path.extname(filePath)) {
            case ".pde":
                return "text/x-processing";
            case ".ino":
            case ".c":
            case ".cpp":
                return "text/x-c";
            case ".java":
                return "text/x-java";
            case ".js":
            case ".jsx":
                return "text/x-javascript";
            case ".ts":
            case ".tsx":
                return "text/x-typescript";
            case ".py":
                return "text/x-python";
            case ".cs":
                return "text/x-csharp";
            case ".fs":
                return "text/x-fsharp";
            case ".vb":
                return "text/x-vb";
            case ".hs":
                return "text/x-haskell";
            case ".pl":
                return "text/x-prolog";
            default:
                return config.openUnknownFiles ? "text/plain" : mimeType;
        }
    } else {
        return mimeType;
    }
}