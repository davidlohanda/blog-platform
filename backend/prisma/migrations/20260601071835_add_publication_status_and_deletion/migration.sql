-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('active', 'suspended_soft', 'suspended_hard', 'pending_deletion');

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "scheduledDeletionAt" TIMESTAMPTZ,
ADD COLUMN     "status" "PublicationStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "suspendReason" TEXT;
