
import { Schema, model } from "mongoose";
import slugify from "slugify";

const postSchema = new Schema(
   {
      title: {
         type: String,
         required: [true, "Post title is required."],
         trim: true,
         maxlength: [150, "Title cannot exceed 150 characters."]
      },

      slug: {
         type: String,
         unique: true,
         lowercase: true,
         trim: true
      },

      excerpt: {
         type: String,
         trim: true,
         maxlength: [300, "Excerpt cannot exceed 300 characters."],
         default: ""
      },

      content: {
         type: String,
         required: [true, "Post content is required."]
      },

      coverImage: {
         publicId: {
            type: String,
            default: ""
         },
         url: {
            type: String,
            default: ""
         },
         alt: {
            type: String,
            trim: true,
            default: ""
         }
      },

      author: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true
      },

      status: {
         type: String,
         enum: ["draft", "published"],
         default: "draft"
      },

      publishedAt: {
         type: Date,
         default: null
      },

      tags: [
         {
            type: String,
            trim: true,
            lowercase: true
         }
      ],

      readCount: {
         type: Number,
         default: 0,
         min: 0
      }
   },
   {
      timestamps: true,
      toJSON: {
         transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
         }
      }
   }
);

postSchema.pre("save", function () {
   if (this.isModified("title") || !this.slug) {
      this.slug = slugify(this.title, {
         lower: true,
         strict: true,
         trim: true
      });
   }
});

postSchema.pre("save", function () {
   if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
   }
});

postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

const Post = model("Post", postSchema);

export default Post;