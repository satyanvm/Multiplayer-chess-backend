/*
  Warnings:

  - Changed the type of `moveNumber` on the `moves` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."moves" DROP COLUMN "moveNumber",
ADD COLUMN     "moveNumber" INTEGER NOT NULL;
