import express, { Router } from 'express';
import { createPost, registerLike } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/:postId/like', registerLike);
router.post('/', createPost);

export default router;