const express = require("express");
const app = express();
const port = 3000;

const connect = require("./schemas");
const postRouter = require("./routes/post.js");
const commentRouter = require("./routes/comment.js");

connect();

app.use(express.json());
app.use("/api", [postRouter, commentRouter]);

app.get("/", (req, res) => {
  res.send("Blog Project");
});

//uri가 잘못되면 실행
app.use((req, res) => {
  res.status(400).json({ message: "URI 형식이 올바르지 않습니다." });
});

app.listen(port, () => {
  console.log(port, "포르톨 서버가 열렸습니다.");
});
