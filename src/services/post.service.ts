import type { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";

export const createPost = async (
  authorId: string,
  caption: string,
  media: string[],
) => {
  const post = await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
    const postData = await tx.post.create({
      data: {
        authorId: authorId,
        caption: caption,
      },
    });
    const postId = postData.id;
    const postMedia = await tx.postMedia.createManyAndReturn({
      data: media.map((mediumUrl) => {
        return {
          postId: postId,
          mediaUrl: mediumUrl,
        };
      }),
    });

    postData.postMedia = postMedia;
    return postData;
  });
  return post;
};
