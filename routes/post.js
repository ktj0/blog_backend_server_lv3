const express = require("express");
const mongoose = require("mongoose");

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");
const authMiddleware = require("../middlewares/auth-middlewares.js");

const router = express.Router();
const { ObjectId } = mongoose.Types;

router
  .route("/")
  .get(async (req, res) => {
    try {
      const posts = await Post.find({}).sort({ createdAt: -1 });

      res.status(200).json({
        posts: posts.map((p) => {
          return {
            postId: p.postId,
            userId: p.userId,
            nickname: p.nickname,
            title: p.title,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        }),
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
  })
  .post(authMiddleware, async (req, res) => {
    try {
      const { userId, nickname } = res.locals.user;
      const { title, content } = req.body;

      if (!title) {
        res
          .status(412)
          .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
      } else if (!content) {
        res
          .status(412)
          .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
      } else if (!title || !content) {
        res
          .status(400)
          .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
      } else {
        await Post.create({ userId, nickname, title, content });

        res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    }
  });

router
  .route("/:postId")
  .get(async (req, res) => {
    try {
      const { postId } = req.params;

      if (!ObjectId.isValid(postId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const post = await Post.findById(postId);

        if (!post) {
          res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
        } else {
          res.status(200).json({
            post: {
              postId: post.postId,
              userId: post.userId,
              nickname: post.nickname,
              title: post.title,
              content: post.content,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
            },
          });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
  })
  .put(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;
      const { title, content } = req.body;

      if (!title) {
        res
          .status(412)
          .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
      } else if (!content) {
        res
          .status(412)
          .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
      } else if (!ObjectId.isValid(postId) || !title || !content) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const post = await Post.findById(postId);

        if (!post) {
          res
            .status(404)
            .json({ errorMessage: "게시글 조회에 실패하였습니다." });
        } else {
          if (post.userId !== userId) {
            res.status(403).json({
              errorMessage: "게시글 수정의 권한이 존재하지 않습니다.",
            });
          } else {
            await Post.findByIdAndUpdate(postId, { title, content });

            res.status(200).json({ message: "게시글을 수정하였습니다." });
          }
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
    }
  })
  .delete(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;

      if (!ObjectId.isValid(postId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const post = await Post.findById(postId);

        if (!post) {
          res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        } else {
          if (post.userId !== userId) {
            res.status(403).json({
              errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
            });
          } else {
            await Post.findByIdAndDelete(postId);

            res.status(200).json({ message: "게시글을 삭제하였습니다." });
          }
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
    }
  });

router
  .route("/:postId/comments")
  .post(authMiddleware, async (req, res) => {
    try {
      const { userId, nickname } = res.locals.user;
      const { postId } = req.params;
      const { comment } = req.body;

      if (!comment) {
        res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      } else if (!ObjectId.isValid(postId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const post = await Post.findById(postId);

        if (!post) {
          res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        } else {
          await Comment.create({ postId, userId, nickname, comment });

          res.status(201).json({ massage: "댓글을 작성하였습니다." });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
  })
  .get(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;

      if (!ObjectId.isValid(postId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

        if (!comments.length) {
          res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        } else {
          res.status(200).json({
            comments: comments.map((c) => {
              return {
                commentId: c.commentId,
                userId: c.userId,
                nickname: c.nickname,
                comment: c.comment,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
              };
            }),
          });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
    }
  });

router
  .route("/:postId/comments/:commentId")
  .put(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId, commentId } = req.params;
      const { comment } = req.body;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        return;
      }

      if (!comment) {
        res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      } else if (!ObjectId.isValid(commentId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const cmt = await Comment.findById(commentId);

        if (!cmt) {
          res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        } else {
          if (cmt.userId !== userId) {
            res
              .status(403)
              .json({ message: "댓글의 수정 권한이 존재하지 않습니다." });
          } else {
            await Comment.findByIdAndUpdate(commentId, { comment });

            res.status(200).json({ message: "댓글을 수정하였습니다." });
          }
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
  })
  .delete(authMiddleware, async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId, commentId } = req.params;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        return;
      }

      if (!ObjectId.isValid(commentId)) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
      } else {
        const comment = await Comment.findById(commentId);

        if (!comment) {
          res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        } else {
          if (comment.userId !== userId) {
            res
              .status(403)
              .json({ message: "댓글의 삭제 권한이 존재하지 않습니다." });
          } else {
            await Comment.findByIdAndDelete(commentId);

            res.status(200).json({ message: "댓글을 삭제하였습니다." });
          }
        }
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  });

module.exports = router;
