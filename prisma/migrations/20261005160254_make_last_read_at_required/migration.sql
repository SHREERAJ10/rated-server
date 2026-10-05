/*
  Warnings:

  - Made the column `lastReadAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastReadAt" SET NOT NULL,
ALTER COLUMN "lastReadAt" SET DEFAULT CURRENT_TIMESTAMP;
