const jwt = require('jsonwebtoken');

function jwtSign(value) {
    return jwt.sign(value, process.env.JWT_SECRET)
}

function jwtVerify(value) {
    return jwt.verify(value, process.env.JWT_SECRET)
}


module.exports = {
    jwtSign,
    jwtVerify
}