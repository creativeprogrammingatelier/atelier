import path from "path";
import fs from "fs";
import crypto from "crypto";

// Private helpers
const keyFilePath = path.join(__dirname, "../../keys/jwtRS256.key");
let authKey;
if (!fs.existsSync(keyFilePath)) {
	fs.mkdirSync(path.dirname(keyFilePath), {recursive: true});
	console.log("Generating keys for signing JWT tokens.");
	const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
		modulusLength: 4096
	});
	authKey = privateKey.export({format: "pem", type: "pkcs1"});
	fs.writeFileSync(keyFilePath, authKey);
	fs.writeFileSync(keyFilePath + ".pub", publicKey.export({format: "pem", type: "pkcs1"}));
} else {
	authKey = fs.readFileSync(keyFilePath, "utf8");
}

// Public constants
export const UPLOADS_PATH = "uploads";
export const AUTHSECRETKEY = authKey;
export const TOKEN_EXPIRATION = "40d"; // TODO: change to a more sensible time limit on tokens
