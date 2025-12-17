/*
  Warnings:

  - You are about to drop the column `client` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `detalhes` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `observacao` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `ponto` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `editedBy` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `order_item_details` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[login]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_item_details" DROP CONSTRAINT "order_item_details_orderItemId_fkey";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "client",
DROP COLUMN "detalhes",
DROP COLUMN "observacao",
DROP COLUMN "ponto",
ADD COLUMN     "meatChoiceId" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "removals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "amount" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "editedBy";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "banner" DROP NOT NULL;

-- DropTable
DROP TABLE "order_item_details";

-- CreateTable
CREATE TABLE "order_item_addons" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "order_item_addons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_meatChoiceId_fkey" FOREIGN KEY ("meatChoiceId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_addons" ADD CONSTRAINT "order_item_addons_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
