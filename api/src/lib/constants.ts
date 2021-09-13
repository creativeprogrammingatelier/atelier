import path from "path";
import {generateKey} from "../helpers/KeyGeneration";

const authKey = generateKey(path.join(__dirname, "../../keys/jwtRS256.key"));
const tempKey = generateKey(path.join(__dirname, "../../keys/tempKey.key"));

// Public constants
export const UPLOADS_PATH = "uploads";
export const AUTHSECRETKEY = authKey;
export const TEMPSECRETKEY = tempKey;
export const TOKEN_EXPIRATION = "2h"; // TODO: change to a more sensible time limit on tokens
