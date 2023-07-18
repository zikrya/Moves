/*
  Warnings:

  - You are about to drop the column `numOfTics` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsSold` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "numOfTics",
DROP COLUMN "ticketsSold";

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "numOfTics" INTEGER,
ADD COLUMN     "ticketsSold" INTEGER NOT NULL DEFAULT 0;
