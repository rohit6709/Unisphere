import Router from 'express';
import { uploadStudents } from '../controllers/csv.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
router.route('/upload-students').post(upload.single('file'), uploadStudents);

export default router;