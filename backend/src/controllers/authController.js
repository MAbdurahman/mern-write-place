/************************** imports **************************/
import crypto from 'crypto';
import User from '../models/userModel.js';
import asyncHandler from '../utils/asyncHandlerUtil.js';
import messageHandler from '../utils/messageHandlerUtil.js';
import setCookieAndToken from '../utils/setCookieAndTokenUtil.js';
import {
   getFirstName,
   validateEmail,
   validatePassword,
   validateFullname
} from '../utils/functionsUtil.js'
import {sendPasswordResetRequestTemplate} from '../services/email/sendEmails.js';
import {sendPasswordResetSuccessTemplate} from '../services/email/sendEmails.js';
import {sendVerificationEmailTemplate} from '../services/email/sendEmails.js';
import {sendWelcomeEmailTemplate} from '../services/email/sendEmails.js';

export const signUpUser = asyncHandler(async (req, res, next) => {
   const {fullname, email, password} = req.body;

   if (!fullname) {
      return next(messageHandler('First and last name are required!', 400));
   }
   if (validateFullname(fullname).isValid === false) {
      const {error} = validateFullname(fullname);
      return next(messageHandler(error, 406));
   }

   if (!email) {
      return next(messageHandler('Email is required', 400));
   }
   if (validateEmail(email).isValid === false) {
      const {error} = validateEmail(email);
      return next(messageHandler(error, 406));
   }

   if (!password) {
      return next(messageHandler('Password is required', 400));
   }
   if (validatePassword(password).isValid === false) {
      const {error} = validatePassword(password);
      return next(messageHandler(error, 406));
   }

   /******************** find out if an user already exists ********************/
   const userAlreadyExists = await User?.findOne({email});

   if (userAlreadyExists) {
      return next(messageHandler('User already exists!', 409));
   }

   /************************* create user and save user ************************/

   const newUser = await new User({
      fullname,
      email,
      password
   });

   await newUser.save();

   const {password: pass, ...rest} = newUser._doc;

   res.status(201).json({
      message: `${getFirstName(fullname)} signed up successfully!`,
      success: true,
      user: rest
   });

});

export const verifyEmail = asyncHandler(async (req, res, next) => {
   const { code } = req.body;
   if (!code) {
      return next(messageHandler('Code is required!', 401));
   }

   const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
   });

   if (!user) {
      return next(messageHandler('Invalid or expired verification token!', 401));
   }

   user.isVerified = true;
   user.verificationToken = undefined;
   user.verificationTokenExpiresAt = undefined;
   await user.save();

   await sendWelcomeEmailTemplate(user, res, next);

});

export const signInUser = asyncHandler(async (req, res, next) => {
   const { email, password } = req.body;

   if (!email) {
      return next(messageHandler('Email is required', 400));
   }
   if (validateEmail(email).isValid === false) {
      const { error } = validateEmail(email);
      return next(messageHandler(error, 406));
   }

   if (!password) {
      return next(messageHandler('Password is required', 400));
   }
   if (validatePassword(password).isValid === false) {
      const { error } = validatePassword(password);
      return next(messageHandler(error, 406));
   }

   const isValidUser = await User?.findOne({ email }).select('+password');
   if (!isValidUser) {
      return next(messageHandler('User not found!', 404));
   }

   const hasValidPassword = await isValidUser.comparePassword(password);
   if (!hasValidPassword) {
      return next(messageHandler('Invalid credentials!', 401));
   }

   if (!isValidUser.isLoggedIn) {
      await isValidUser.toggleIsLoggedIn();
      await isValidUser.updateLastLoginTime();
   }

   setCookieAndToken(isValidUser, res, 200);

});

export const signOutUser = asyncHandler(async (req, res, next) => {
   const user = req.user;

   if (!user) {
      return next(messageHandler('User not found!', 404));
   }
   if (user.isLoggedIn) {
      await user.toggleIsLoggedIn();
   }

   res.cookie('write_place_access', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
   });

   res.status(200).json({
      message: `${getFirstName(user?.fullname)} signed out successfully!`,
      success: true,
      isLoggedIn: user.isLoggedIn,
   });
});