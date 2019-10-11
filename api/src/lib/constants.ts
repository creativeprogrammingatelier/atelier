
import path from "path";

const keyFilePath = path.join(__dirname, '../../keys/jwtRS256.key')
 
export const Constants :Readonly<{AUTHSECRETKEY:any}> = Object.freeze({
    AUTHSECRETKEY: require('fs').readFileSync(keyFilePath, 'utf8')
});

