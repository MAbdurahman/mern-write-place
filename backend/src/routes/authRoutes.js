/************************** imports **************************/
import express from 'express';
import {signUpUser, signInUser, signOutUser} from '../controllers/authController.js';

import {authenticateUser, authorizeRoles} from '../middlewares/authMiddleware.js';
/************************* variables *************************/
const router = express.Router();


/************************ auth routes ************************/
router.post('/auth/sign-up', signUpUser);
router.post('/auth/sign-in', signInUser);
router.post('/auth/sign-out', authenticateUser, signOutUser);







export default router;