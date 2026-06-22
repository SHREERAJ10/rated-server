import express, { Router } from 'express';
import { activateUser } from '../controllers/user.controller.js';

const router:Router = express.Router();

router.post('/' ,activateUser);

export default router;