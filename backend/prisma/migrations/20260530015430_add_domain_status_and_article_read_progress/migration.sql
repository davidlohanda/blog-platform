-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('pending', 'verified', 'failed');

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "customDomainStatus" "DomainStatus";
