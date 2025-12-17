-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "nonRemovable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 999;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 999;
