const express = require("express");
const mongoose = require("mongoose");
const Comment = require("../schemas/comment.js");

const router = express.Router();
const { ObjectId } = mongoose.Types;

router
  .route("/:postId")
  .get(async (req, res) => {
    const { postId } = req.params;

    if (!ObjectId.isValid(postId)) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

      res.send(
        comments.map((c) => {
          return {
            commentId: c.commentId,
            user: c.user,
            content: c.content,
            createdAt: c.createdAt,
          };
        })
      );
    }
  })
  .post(async (req, res) => {
    const { postId } = req.params;
    const { user, password, content } = req.body;

    if (!content) {
      res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    } else if (!ObjectId.isValid(postId) || !user || !password) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      await Comment.create({ postId, user, password, content });

      res.status(200).json({ massage: "댓글을 생성하였습니다." });
    }
  });

router
  .route("/:commentId")
  .put(async (req, res) => {
    const { commentId } = req.params;
    const { password, content } = req.body;

    if (!content) {
      res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    } else if (!ObjectId.isValid(commentId) || !password) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
      } else {
        if (comment.password !== password) {
          res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
        } else {
          await Comment.findByIdAndUpdate(commentId, { content });

          res.status(200).json({ message: "댓글을 수정하였습니다." });
        }
      }
    }
  })
  .delete(async (req, res) => {
    const { commentId } = req.params;
    const { password } = req.body;

    if (!ObjectId.isValid(commentId) || !password) {
      res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    } else {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
      } else {
        if (comment.password !== password) {
          res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
        } else {
          await Comment.findByIdAndDelete(commentId);

          res.status(200).json({ message: "댓글을 삭제하였습니다." });
        }
      }
    }
  });

module.exports = router;
