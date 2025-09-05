/*
  Warnings:

  - Added the required column `moveNumber` to the `moves` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."moves" ADD COLUMN     "moveNumber" TEXT NOT NULL;
