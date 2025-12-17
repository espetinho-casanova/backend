-- AlterTable
ALTER TABLE "orders" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "table" SET DATA TYPE TEXT;
