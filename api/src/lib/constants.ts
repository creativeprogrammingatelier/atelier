import path from "path";
import fs from "fs";
import crypto from "crypto";

// Private helpers
function generateKey(filePath: string) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        console.log("Generating keys for signing JWT tokens.");
        const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096
        });
        const key = privateKey.export({format: "pem", type: "pkcs1"});
        fs.writeFileSync(filePath, key);
        fs.writeFileSync(filePath + ".pub", publicKey.export({format: "pem", type: "pkcs1"}));
        return key;
    } else {
        return fs.readFileSync(filePath, "utf8");
    }
}

let authKey = generateKey(path.join(__dirname, "../../keys/jwtRS256.key"));
let tempKey = generateKey(path.join(__dirname, "../../keys/tempKey.key"))

// Public constants
export const UPLOADS_PATH = "uploads";
export const AUTHSECRETKEY = authKey;
export const TEMPSECRETKEY = tempKey;
export const TOKEN_EXPIRATION = "2h"; // TODO: change to a more sensible time limit on tokens
