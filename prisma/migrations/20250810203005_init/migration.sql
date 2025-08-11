-- CreateTable
CREATE TABLE "public"."Game" (
    "id" INTEGER NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Move" (
    "move" TEXT NOT NULL,
    "createdAtSec" TIMESTAMP(0) NOT NULL,
    "gameId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Move_createdAtSec_key" ON "public"."Move"("createdAtSec");

-- AddForeignKey
ALTER TABLE "public"."Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
