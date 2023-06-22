const express = require("express");
const router = express.Router();
const postsRouter = require("./post.js");
const commentsRouter = require("./comment.js");

const defaultRoutes = [
  {
    path: "/posts",
    route: postsRouter,
  },
  {
    path: "/comments",
    route: commentsRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
