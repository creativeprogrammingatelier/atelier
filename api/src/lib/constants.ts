import path from 'path';
import fs from 'fs';

// Private helpers
const keyFilePath = path.join(__dirname, "../../keys/jwtRS256.key");

// Public constants
export const UPLOADS_PATH = "uploads";
export const AUTHSECRETKEY = fs.readFileSync(keyFilePath, "utf8");
export const TOKEN_EXPIRATION = "40d"; // TODO: change to a more sensible time limit on tokens
