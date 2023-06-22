const express = require("express");
const postsRouter = require("./post.js");
const commentsRouter = require("./comment.js");
const usersRouter = require("./user.js");
const loginRouter = require("./login.js");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/posts",
    route: postsRouter,
  },
  {
    path: "/comments",
    route: commentsRouter,
  },
  {
    path: "/signup",
    route: usersRouter,
  },
  {
    path: "/login",
    route: loginRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
