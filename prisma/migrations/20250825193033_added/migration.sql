-- CreateTable
CREATE TABLE "public"."users" (
    "id" INTEGER NOT NULL,
    "isGuest" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
