/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "date" TEXT,
ADD COLUMN     "location" TEXT;

-- DropTable
DROP TABLE "Note";
