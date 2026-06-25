import express, { Router } from 'express';
import { createPost, registerLike, registerScore } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/:postId/like', registerLike);
router.post('/:postId/rate', registerScore);
router.post('/', createPost);

export default router;