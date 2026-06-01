-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailBounceCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailBounced" BOOLEAN NOT NULL DEFAULT false;
