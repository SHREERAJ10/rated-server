import express, { Router } from 'express';
import { activateUser, fetchUser, getNotification, getNotificationStatus, getOnboardingStatus, getUser, updateNotificationStatus } from '../controllers/user.controller.js';

const router:Router = express.Router();

router.post('/' ,activateUser);
router.get('/' ,fetchUser);
router.get('/me', getOnboardingStatus);
router.get("/notification", getNotification);
router.get('/notification/status', getNotificationStatus);
router.put("/notification/status", updateNotificationStatus);
router.get('/:username' ,getUser);

export default router;