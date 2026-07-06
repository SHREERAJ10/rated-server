import express, { Router } from 'express';
import { createPost, getComment, getPost, getPostLikers, registerComment, registerLike, registerScore } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/:postId/like', registerLike);
router.post('/:postId/rate', registerScore);
router.post('/:postId/comment', registerComment);
router.get('/:postId/comment', getComment);
router.get('/:postId/like', getPostLikers)
router.post('/', createPost);
router.get('/', getPost);

export default router;