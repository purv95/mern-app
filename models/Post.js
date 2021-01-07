const { model, Schema, SchemaTypes } = require("mongoose");

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  image: {
    type: Array,
    default: [
      {
        url: "https://via.placeholder.com/200x200.png?text=Profile",
        public_id: Date.now,
      },
    ],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Post", postSchema);
