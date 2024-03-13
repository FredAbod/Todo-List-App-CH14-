const jwt = require("jsonwebtoken");


const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) throw new Error("Authentication failed");
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) throw new Error("Authentication failed");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed: 🔒🔒🔒🔒🔒" });
  }
};

const createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2day",
  });
  return token;
};

const verifyJwtToken = (token, next) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (err) {
    next(err);
  }
};

const passwordJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5m" });
  return token;
};

module.exports = {
  isAuthenticated,
  createJwtToken,
  verifyJwtToken,
  passwordJwtToken,
};
