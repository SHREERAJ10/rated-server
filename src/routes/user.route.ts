import express, { Router } from 'express';
import { activateUser, fetchUser, fetchUsers, getNotification, getNotificationStatus, getOnboardingStatus, getUser, updateNotificationStatus } from '../controllers/user.controller.js';
import { getUserPosts } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/' ,activateUser);
router.get('/' ,fetchUser);
router.get('/me', getOnboardingStatus);
router.get("/search", fetchUsers);
router.get("/notification", getNotification);
router.get('/notification/status', getNotificationStatus);
router.put("/notification/status", updateNotificationStatus);
router.get("/:username/posts", getUserPosts);
router.get('/:username' ,getUser);

export default router;