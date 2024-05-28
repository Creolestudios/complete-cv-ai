/*
  Warnings:

  - You are about to drop the column `CandidateURL` on the `DashTable` table. All the data in the column will be lost.
  - Added the required column `UserURL` to the `DashTable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DashTable" DROP COLUMN "CandidateURL",
ADD COLUMN     "UserURL" TEXT NOT NULL,
ALTER COLUMN "URL" DROP DEFAULT;
