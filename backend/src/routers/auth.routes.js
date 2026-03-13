import Router from 'express';
import { loginUser, logoutUser, changeCurrentPassword, forgotPassword, refreshAccessToken } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/change-password').put(verifyJWT, changeCurrentPassword);
router.route('/forgot-password').post(verifyJWT, forgotPassword);
router.route('/refresh-token').post(refreshAccessToken);


export default router;

