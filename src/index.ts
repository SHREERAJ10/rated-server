import express, { type Request, type Response } from "express";
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import verifyToken from "./middlewares/verifyToken.js";
import { generateCloudinaryUploadSignature } from "./utils/generateCloudinaryUploadSignature.js";

const app = express();

app.use(express.json());

app.get('/signature', verifyToken, async (req:Request, res:Response)=>{
      const id = req.uid ?? '';
      const signature = await generateCloudinaryUploadSignature(id);
      res.status(200).json({success:true, data:signature})
})
app.use('/user', verifyToken, userRouter);
app.use('/post',verifyToken, postRouter);

app.listen(3000, () => {
  console.log("Listening at port 3000");
});