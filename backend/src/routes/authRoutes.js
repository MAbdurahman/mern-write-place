/************************** imports **************************/
import express from 'express';
import {
   signUpUser,
   signInUser,
   signOutUser,
   getCurrentUserProfile, updateCurrentUserProfile, updateCurrentUserPassword,
   getAllUsersAdmin, getSingleUserAdmin, updateUserProfileAdmin, deleteUserAdmin,
   sendPasswordReset, verifyTokenAndResetPassword
} from '../controllers/authController.js';

import {authenticateUser, authorizeRoles} from '../middlewares/authMiddleware.js';
/************************* variables *************************/
const router = express.Router();

/************************ auth routes ************************/
router.post('/auth/sign-up', signUpUser);
router.post('/auth/sign-in', signInUser);
router.post('/auth/sign-out', authenticateUser, signOutUser);
router.get('/auth/me', authenticateUser, getCurrentUserProfile);
router.patch('/auth/me/password', authenticateUser, updateCurrentUserPassword);
router.put('/auth/me', authenticateUser, updateCurrentUserProfile);

router.post("/auth/password/forgot", sendPasswordReset);
router.patch("/auth/password/reset/:token", verifyTokenAndResetPassword);

/************************* admin routes *************************/
router.get('/admin/users', authenticateUser, authorizeRoles('admin'), getAllUsersAdmin);
router.get('/admin/users/:userId', authenticateUser, authorizeRoles('admin'), getSingleUserAdmin);
router.put('/admin/users/:userId', authenticateUser, authorizeRoles('admin'), updateUserProfileAdmin);
router.delete('/admin/users/:userId', authenticateUser, authorizeRoles('admin'), deleteUserAdmin);



export default router;