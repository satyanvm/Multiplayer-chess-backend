/*
  Warnings:

  - The primary key for the `games` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."moves" DROP CONSTRAINT "moves_gameId_fkey";

-- AlterTable
ALTER TABLE "public"."games" DROP CONSTRAINT "games_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."moves" ALTER COLUMN "gameId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
