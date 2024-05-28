/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Team` table. All the data in the column will be lost.
  - Added the required column `activeSince` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "createdAt",
ADD COLUMN     "activeSince" TIMESTAMP(3) NOT NULL;
