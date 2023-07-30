function errorHandler(err, req, res, next) {
  console.log(err);
  switch (err.name) {
    case "SequelizeValidationError":
      res.status(400).json({ message: err.errors[0].message });
      break;

    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: "Email must be unique" });
      break;

    case "NullEmail":
      res.status(400).json({ message: "Email is required" });
      break;

    case "NullPassword":
      res.status(400).json({ message: "Password is required" });
      break;

    case "InvalidEmailPassword":
      res.status(401).json({ message: "Invalid email/password" });
      break;

    case "InvalidUsernamePassword":
      res.status(401).json({ message: "Invalid username/password" });
      break;

    case "NOTFOUND":
      res.status(404).json({ message: "Data not found!" });
      break;

    case "Unauthenticated":
      res.status(403).json({ message: "You are not authorized" });
      break;

    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      break;

    case "MidtransError":
      res.status(400).json({ message: err.ApiResponse.error_messages[0] });
      break;

    case "InvalidBooking":
      res.status(400).json({ message: "Invalid booking" });
      break;

    default:
      res.status(500).json({ message: "Internal server error" });
      break;
  }
}

module.exports = errorHandler;
