import express, { Router } from 'express';
import { activateUser, fetchUser, getOnboardingStatus, getUser } from '../controllers/user.controller.js';

const router:Router = express.Router();

router.post('/' ,activateUser);
router.get('/' ,fetchUser);
router.get('/me', getOnboardingStatus);
router.get('/:username' ,getUser);

export default router;