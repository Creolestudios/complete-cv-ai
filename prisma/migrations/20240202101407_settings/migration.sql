/*
  Warnings:

  - Added the required column `Firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Lastname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Firstname" TEXT NOT NULL,
ADD COLUMN     "Lastname" TEXT NOT NULL,
ADD COLUMN     "Role" TEXT NOT NULL,
ADD COLUMN     "mobile" TEXT NOT NULL;
