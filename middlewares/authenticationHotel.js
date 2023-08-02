const { jwtVerify } = require("../helpers/jwt");
const { Hotel } = require("../models");

async function authenticationHotel(req, res, next) {
  try {
    const { access_token } = req.headers;
    const { id, email } = jwtVerify(access_token);
    
    const hotel = await Hotel.findOne({
      where: {
        id,
        email,
      },
    });
    if (!hotel) throw { name: "Unauthenticated" };

    req.hotel = { id, email };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticationHotel;
