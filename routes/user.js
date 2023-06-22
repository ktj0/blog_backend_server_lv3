const express = require("express");
const User = require("../schemas/user.js");

const router = express.Router();

router.route("/").post(async (req, res) => {
  try {
    const { nickname, password, confirm } = req.body;

    if (!nickname) {
      res
        .status(412)
        .json({ errorMessage: "닉네임 형식이 일치하지 않습니다." });
      return;
    } else if (!password) {
      res
        .status(412)
        .json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
      return;
    } else if (password !== confirm) {
      res.status(412).json({
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
      return;
    } else if (password.includes(nickname)) {
      res
        .status(412)
        .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
      return;
    } else {
      const isExistNickname = await User.findOne({ nickname });

      if (isExistNickname) {
        res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
        return;
      }
    }

    const user = await User.create({ nickname, password });

    res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;
