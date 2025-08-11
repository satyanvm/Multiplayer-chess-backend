/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Move` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Move" DROP CONSTRAINT "Move_gameId_fkey";

-- DropTable
DROP TABLE "public"."Game";

-- DropTable
DROP TABLE "public"."Move";

-- CreateTable
CREATE TABLE "public"."games" (
    "id" INTEGER NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moves" (
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "createdAtSec" TIMESTAMP(0) NOT NULL,
    "gameId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "moves_createdAtSec_key" ON "public"."moves"("createdAtSec");

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
