/*
  Warnings:

  - Made the column `userId` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "order_item_details" (
    "id" TEXT NOT NULL,
    "observacao" TEXT NOT NULL,
    "ponto" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_item_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_details" ADD CONSTRAINT "order_item_details_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
