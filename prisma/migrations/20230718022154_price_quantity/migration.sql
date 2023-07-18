/*
  Warnings:

  - You are about to drop the column `numOfTics` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsSold` on the `Price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Price" DROP COLUMN "numOfTics",
DROP COLUMN "ticketsSold",
ADD COLUMN     "quantity" INTEGER;
