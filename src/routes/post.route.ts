import express, { Router } from 'express';
import { createPost, deleteLike, getComment, getPost, getPostLikers, getUserPosts, registerComment, registerLike, registerScore } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/:postId/like', registerLike);
router.delete('/:postId/unlike', deleteLike);
router.post('/:postId/rate', registerScore);
router.post('/:postId/comment', registerComment);
router.get('/:postId/comment', getComment);
router.get('/:postId/like', getPostLikers)
router.get('/:username', getUserPosts);
router.post('/', createPost);
router.get('/', getPost);

export default router;