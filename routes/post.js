const express = require("express");
const router = express.Router();

const postDb = require("../schemas/post.js");
const commentDb = require("..//schemas/comment.js");

//게시글 작성
router.post("/posts", async (req, res) => {
  try {
    //mongoDB에서 schema type을 Date로 지정하면 날짜가 UTC기준으로 설정이 된다.
    //type이 Date면 moment나 다른 메서드를 사용해도 mongoDB에서 자체적으로 UTC로 바꾸는거 같아서
    //한국시간보다 9시간 전이여서 그냥 시간 자체에 9를 더했다.
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() + 9);

    const { user, password, title, content } = req.body;

    //수정된 날짜도 넣어봤다.
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

//게시글 조회
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

//게시글 상세 조회
router.get("/posts/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;

    //find를 사용하면 배열로 나와서
    //_id값이 unique한 값이라 하나밖에 없기 때문에 findOne을 사용했다.
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

//게시글 수정
router.put("/posts/:_postId", async (req, res) => {
  try {
    //수정된 날짜
    const updatedAt = new Date();
    updatedAt.setHours(updatedAt.getHours() + 9);

    const { _postId } = req.params;
    const { password, title, content } = req.body;

    //비밀번호를 입력하지 않았을 때
    if (!password) {
      return res.status(401).json({ message: "비밀번호를 입력해주세요." });
    }

    const detailPost = await postDb.findOne({ _id: _postId });

    //existPwd는 findOne으로 조건을 두 개 주었는데 password 하나로만 find하면
    //params에 수정할 게시글의 id값을 주고 다른 게시물의 비밀번호를 입력하면
    //비밀번호를 입력한 게시글이 수정이 되어서 두 개의 조건 모두 충족하는지를 본다.
    const existPwd = await postDb.findOne({ _id: _postId, password });

    if (!detailPost) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    if (!existPwd) {
      return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await postDb.updateOne(
      { _id: _postId },
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

//게시글 삭제
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

    //게시글을 삭제하면 해당 댓글도 같이 삭제
    await commentDb.deleteMany({ _postId });

    res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;
