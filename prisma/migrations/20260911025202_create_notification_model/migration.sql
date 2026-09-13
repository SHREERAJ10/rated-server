-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'RATE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL,
    "type" "NotificationType" NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
