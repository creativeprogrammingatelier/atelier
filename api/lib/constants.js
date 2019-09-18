
module.exports = 


Object.freeze({
    AUTHSECRETKEY: require('fs').readFileSync('./keys/jwtRS256.key', 'utf8')
});