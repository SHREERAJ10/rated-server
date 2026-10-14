import express, { type Request, type Response } from "express";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import verifyToken from "./middlewares/verifyToken.js";
import { generateCloudinaryUploadSignature } from "./utils/generateCloudinaryUploadSignature.js";
import cors from "cors";
import { configDotenv } from "dotenv";
import helmet from "helmet";
import { prisma } from "../db.js";

configDotenv();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.get("/signature", verifyToken, async (req: Request, res: Response) => {
  const id = req.uid ?? "";
  const signature = await generateCloudinaryUploadSignature(id);
  res.status(200).json({ success: true, data: signature });
});
app.use("/user", verifyToken, userRouter);
app.use("/post", verifyToken, postRouter);

app.get("/health", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("Server is running");
});
