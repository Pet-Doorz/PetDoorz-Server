const bcrypt = require("bcryptjs");

function encrypt(value) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(value, salt);
  return hash;
}

function decrypt(value, hash) {
  return bcrypt.compareSync(value, hash);
}

module.exports = {
  encrypt,
  decrypt,
};
