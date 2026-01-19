/*
  Warnings:

  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postalCode` on the `Vote` table. All the data in the column will be lost.
  - The primary key for the `VoteItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rank` on the `VoteItem` table. All the data in the column will be lost.
  - You are about to drop the `songs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[emailNormalized]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voteId,songId]` on the table `VoteItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailNormalized` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipcode` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `VoteItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Country" AS ENUM ('BELGIUM', 'OTHER');

-- DropForeignKey
ALTER TABLE "VoteItem" DROP CONSTRAINT "VoteItem_songId_fkey";

-- DropForeignKey
ALTER TABLE "VoteItem" DROP CONSTRAINT "VoteItem_voteId_fkey";

-- DropIndex
DROP INDEX "Vote_email_key";

-- DropIndex
DROP INDEX "VoteItem_songId_idx";

-- DropIndex
DROP INDEX "VoteItem_voteId_rank_key";

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
DROP COLUMN "postalCode",
ADD COLUMN     "country" "Country" NOT NULL,
ADD COLUMN     "emailNormalized" TEXT NOT NULL,
ADD COLUMN     "otherCountry" TEXT,
ADD COLUMN     "zipcode" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vote_id_seq";

-- AlterTable
ALTER TABLE "VoteItem" DROP CONSTRAINT "VoteItem_pkey",
DROP COLUMN "rank",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "voteId" SET DATA TYPE TEXT,
ADD CONSTRAINT "VoteItem_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "songs";

-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_ipHash_idx" ON "Vote"("ipHash");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_emailNormalized_key" ON "Vote"("emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "VoteItem_voteId_songId_key" ON "VoteItem"("voteId", "songId");

-- AddForeignKey
ALTER TABLE "VoteItem" ADD CONSTRAINT "VoteItem_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteItem" ADD CONSTRAINT "VoteItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
