/*
  Warnings:

  - You are about to drop the column `URL` on the `DashTable` table. All the data in the column will be lost.
  - You are about to drop the column `UserURL` on the `DashTable` table. All the data in the column will be lost.
  - You are about to drop the column `ZipURL` on the `DashTable` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DashTable" DROP COLUMN "URL",
DROP COLUMN "UserURL",
DROP COLUMN "ZipURL";
