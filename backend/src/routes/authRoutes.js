/************************** imports **************************/
import express from 'express';
import {signUpUser} from '../controllers/authController.js';


/************************* variables *************************/
const router = express.Router();


/************************ auth routes ************************/
router.post('/auth/sign-up', signUpUser);







export default router;