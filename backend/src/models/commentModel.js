import { Schema, model } from "mongoose";


const commentSchema = new Schema(
   {
      post: {
         type: Schema.Types.ObjectId,
         ref: "Post",
         required: true
      },
      author: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true
      },
      content: {
         type: String,
         trim: true,
         required: true,
         maxlength: 1000
      },
      isApproved: {
         type: Boolean,
         default: false
      }
   },
   { timestamps: true }
);

const Comment = model("Comment", commentSchema);

export default Comment;