const express = require("express");
const mongoose = require("mongoose");
const Post = require("../schemas/post.js");

const router = express.Router();
const { ObjectId } = mongoose.Types;

router
  .route("/")
  .get(async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: -1 });

    res.send(
      posts.map((p) => {
        return {
          postId: p.postId,
          user: p.user,
          title: p.title,
          createdAt: p.createdAt,
        };
      })
    );
  })
  .post(async (req, res) => {
    const { user, password, title, content } = req.body;

    if (!user || !password || !title || !content) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      await Post.create({ user, password, title, content });

      res.status(200).json({ message: "게시글을 생성하였습니다." });
    }
  });

router
  .route("/:postId")
  .get(async (req, res) => {
    const { postId } = req.params;

    if (!ObjectId.isValid(postId)) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
      } else {
        res.send({
          postId: post.postId,
          user: post.user,
          title: post.title,
          content: post.content,
          createdAt: post.createdAt,
        });
      }
    }
  })
  .put(async (req, res) => {
    const { postId } = req.params;
    const { password, title, content } = req.body;

    if (!ObjectId.isValid(postId) || !password || !title || !content) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
      } else {
        if (post.password !== password) {
          res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
        } else {
          await Post.findByIdAndUpdate(postId, { title, content });

          res.status(200).json({ message: "게시글을 수정하였습니다." });
        }
      }
    }
  })
  .delete(async (req, res) => {
    const { postId } = req.params;
    const { password } = req.body;

    if (!ObjectId.isValid(postId) || !password) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
      } else {
        if (post.password !== password) {
          res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
        } else {
          await Post.findByIdAndDelete(postId);

          res.status(200).json({ message: "게시글을 삭제하였습니다." });
        }
      }
    }
  });

module.exports = router;
