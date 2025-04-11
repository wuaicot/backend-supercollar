-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "reportedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "deletedAt" TIMESTAMP(3);
