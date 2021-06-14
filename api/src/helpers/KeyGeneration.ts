// Private helpers
import fs from "fs";
import path from "path";
import crypto from "crypto";

export function generateKey(filePath: string) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        console.log('Generating keys for signing JWT tokens.');
        const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
        });
        const key = privateKey.export({format: 'pem', type: 'pkcs1'});
        fs.writeFileSync(filePath, key);
        fs.writeFileSync(filePath + '.pub', publicKey.export({format: 'pem', type: 'pkcs1'}));
        return key;
    } else {
        return fs.readFileSync(filePath, 'utf8');
    }
}