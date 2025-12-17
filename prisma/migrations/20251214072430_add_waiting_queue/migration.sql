-- CreateTable
CREATE TABLE "waiting_queue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "waiting_queue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "waiting_queue" ADD CONSTRAINT "waiting_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
