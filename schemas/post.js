const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

postSchema.virtual("postId").get(function () {
  return this._id.toHexString();
});
postSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
