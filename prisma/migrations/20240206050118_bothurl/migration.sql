/*
  Warnings:

  - Added the required column `CandidateURL` to the `DashTable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `URL` to the `DashTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DashTable" ADD COLUMN     "CandidateURL" TEXT NOT NULL,
ADD COLUMN     "URL" TEXT NOT NULL;
