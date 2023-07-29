const { jwtVerify } = require("../helpers/jwt");
const { Customer } = require("../models");

async function authenticationCustomer(req, res, next) {
  try {
    const { access_token } = req.headers;
    const { id, email } = jwtVerify(access_token);

    const customer = await Customer.findOne({
      where: {
        id,
        email,
      },
    });
    if (!customer) throw { name: "Unauthenticated" };

    req.customer = { id };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticationCustomer;
