/*
  Warnings:

  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoteItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mixId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VoteItem" DROP CONSTRAINT "VoteItem_songId_fkey";

-- DropForeignKey
ALTER TABLE "VoteItem" DROP CONSTRAINT "VoteItem_voteId_fkey";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "mixId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Song";

-- DropTable
DROP TABLE "VoteItem";

-- CreateTable
CREATE TABLE "Mix" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Mix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_mixId_idx" ON "Vote"("mixId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_mixId_fkey" FOREIGN KEY ("mixId") REFERENCES "Mix"("id") ON DELETE CASCADE ON UPDATE CASCADE;
