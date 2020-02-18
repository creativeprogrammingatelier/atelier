import path from 'path';
import fs from 'fs';

// Private helpers
const keyFilePath = path.join(__dirname, "../../keys/jwtRS256.key");

// Public constants
export const UPLOADS_PATH = "uploads";
export const CODEFILE_EXTENSIONS = [ ".pde" ];
export const AUTHSECRETKEY = fs.readFileSync(keyFilePath, "utf8");
