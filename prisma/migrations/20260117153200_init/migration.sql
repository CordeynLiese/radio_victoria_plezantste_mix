/*
  Warnings:

  - Added the required column `year` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "year" TEXT NOT NULL;
