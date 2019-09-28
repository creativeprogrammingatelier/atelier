
 
export const Constants :Readonly<{AUTHSECRETKEY:any}> = Object.freeze({
    AUTHSECRETKEY: require('fs').readFileSync('./keys/jwtRS256.key', 'utf8')
});

