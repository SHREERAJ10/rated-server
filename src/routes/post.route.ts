import express, { Router } from 'express';
import { createPost } from '../controllers/post.controller.js';

const router:Router = express.Router();

router.post('/', createPost);

export default router;