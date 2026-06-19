const User = require("../models/User");

const apiProtect = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!apiKey) {
      return res.status(401).json({ message: "Access denied. No API Key provided in 'x-api-key' header." });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ message: "Access denied. Invalid API Key." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = apiProtect;
