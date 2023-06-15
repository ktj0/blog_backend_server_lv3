const express = require("express");
const router = express.Router();

const postDb = require("../schemas/post.js");
const commentDb = require("..//schemas/comment.js");

router.post("/posts", async (req, res) => {
  try {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() + 9);

    const { user, password, title, content } = req.body;

    await postDb.create({
      user,
      password: password,
      title,
      content,
      createdAt,
      updatedAt: null,
    });

    res.status(200).json({ message: "게시글을 생성하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

router.get("/posts", async (req, res) => {
  const postAll = await postDb.find({});

  postAll.reverse();

  const data = postAll.map((post) => {
    const { _id, user, title, createdAt } = post;

    const data = {
      postId: _id,
      user,
      title,
      createdAt,
    };

    return data;
  });

  res.status(200).json({ data });
});

router.get("/posts/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;

    const detailPost = await postDb.findOne({ _id: _postId });

    if (!detailPost) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    const { _id, user, title, content, createdAt, updatedAt } = detailPost;

    const data = {
      postId: _id,
      user,
      title,
      content,
      createdAt,
      updatedAt,
    };

    res.status(200).json({ data });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

router.put("/posts/:_postId", async (req, res) => {
  try {
    const updatedAt = new Date();
    updatedAt.setHours(updatedAt.getHours() + 9);

    const { _postId } = req.params;
    const { password, title, content } = req.body;

    if (!password) {
      return res.status(401).json({ message: "비밀번호를 입력해주세요." });
    }

    const detailPost = await postDb.findOne({ _id: _postId });
    const existPwd = await postDb.findOne({ _id: _postId, password });

    if (!detailPost) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    if (!existPwd) {
      return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await postDb.updateOne(
      { password },
      {
        $set: {
          title,
          content,
          updatedAt,
        },
      }
    );

    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

router.delete("/posts/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(401).json({ message: "비밀번호를 입력해주세요" });
    }

    const detailPost = await postDb.findOne({ _id: _postId });
    const existPwd = await postDb.findOne({ _id: _postId, password });

    if (!detailPost) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    if (!existPwd) {
      return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await postDb.deleteOne({ _id: _postId });

    await commentDb.deleteMany({ _postId });

    res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;
