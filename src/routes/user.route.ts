import express, { Router } from 'express';
import { activateUser, getOnboardingStatus, getUser } from '../controllers/user.controller.js';

const router:Router = express.Router();

router.post('/' ,activateUser);
router.get('/me', getOnboardingStatus);
router.get('/:username' ,getUser);

export default router;