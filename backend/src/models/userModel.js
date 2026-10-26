import {Schema, model} from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import moment from 'moment';

/****************************** schema ******************************/
const userSchema = new Schema({
      fullname: {
         type: String,
         trim: true,
         required: [true, 'First and last name are required!']
      },
      email: {
         type: String,
         trim: true,
         lowercase: true,
         required: [true, 'Email is required.'],
         unique: [true, 'Email already exists!'],
         validate: [validator.isEmail, 'Enter a valid email address.']
      },
      password: {
         type: String,
         trim: true,
         required: [true, 'Password is required!'],
         minLength: [8, 'Password must be at least eight (8) characters!'],
         select: false
      },
      role: {
         type: String,
         enum: ['user', 'admin'],
         required: true,
         default: 'user'
      },
      profile: {
         bio: {
            type: String,
            trim: true,
            maxlength: [200, 'Bio cannot exceed 200 characters.'],
            default: ''
         },
         image: {
            publicId: {
               type: String,
               default: ''
            },
            url: {
               type: String,
               default: ''
            }
         },
         socialLinks: {
            github: {type: String, default: ''},
            website: {type: String, default: ''}
         }
      },
      lastLoginTime: {
         type: String,
         default: null
      },
      lastLoginDisplay: {
         type: String,
         default: ""
      },
      isLoggedIn: {
         type: Boolean,
         default: false
      },
      isVerified: {
         type: Boolean,
         required: true,
         default: false
      },
      resetPasswordToken: String,
      resetPasswordExpiresAt: Date,

      verificationToken: String,
      verificationTokenExpiresAt: Date

   },
   {
      timestamps: true,
      toJSON: {
         transform: (_doc, ret) => {
            delete ret?.password;
            delete ret?.resetPasswordToken;
            delete ret?.verificationToken;
            return ret;
         }
      }
   }
);

/************** hash password before saving user ****************/
userSchema.pre('save', async function () {
   if (!this.isModified('password')) {
      return;
   }
   this.password = await bcrypt.hash(this.password, 12);
});

/******************** format lastLoginTime **********************/
userSchema.methods.updateLastLoginTime = function () {
   const now = new Date();

   this.lastLoginTime = now;

   this.lastLoginDisplay = now.toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
   });

   return this.save();
};

/********************* toggle isLoggedIn ***********************/
userSchema.methods.toggleIsLoggedIn = function () {
   this.isLoggedIn = !this.isLoggedIn;
   return this.save();
};

/********************* compare password ***********************/
userSchema.methods.comparePassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
};

/****************** generate JsonWebToken ********************/
userSchema.methods.generateJsonWebToken = function () {
   return jwt.sign(
      {id: this._id, role: this.role, isLoggedIn: this.isLoggedIn},
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.JWT_EXPIRES_TIME
      }
   );
};

/****************** generate resetPasswordToken ********************/
userSchema.methods.generateResetPasswordToken = function () {

   /**************** generate the token ****************/
   const resetToken = crypto.randomBytes(20).toString('hex');

   /**************** hash and set to resetPasswordToken ****************/
   this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

   /**************** set token to expire ****************/
   this.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; //30 minutes

   return resetToken;
};

/****************** generate verificationToken ********************/
userSchema.methods.generateVerificationToken = function () {
   this.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
   this.verificationTokenExpiresAt = Date.now() + 60 * 60 * 1000 * 24; // 24 hours

   return this.verificationToken;
};

const User = new model('User', userSchema);
export default User;