const jwt = require("jsonwebtoken");

const User = require("../schemas/user.js");

module.exports = async (req, res) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(400).json({ errorMessage: "로그인 후 이용 가능한 기능입니다." });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "customized-secret-key");
    const user = await User.findById(userId);

    res.locals.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(400).json({ errorMessage: "로그인 후 이용 가능한 기능입니다." });
  }
};
