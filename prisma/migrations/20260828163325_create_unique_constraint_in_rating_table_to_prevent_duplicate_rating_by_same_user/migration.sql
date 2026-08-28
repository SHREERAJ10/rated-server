/*
  Warnings:

  - A unique constraint covering the columns `[postId,ratedByUserId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rating_postId_ratedByUserId_key" ON "Rating"("postId", "ratedByUserId");
