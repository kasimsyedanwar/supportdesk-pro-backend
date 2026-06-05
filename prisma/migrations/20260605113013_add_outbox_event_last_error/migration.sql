/*
  Warnings:

  - You are about to drop the column `error` on the `outbox_events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "outbox_events_createdAt_idx";

-- DropIndex
DROP INDEX "outbox_events_type_idx";

-- AlterTable
ALTER TABLE "outbox_events" DROP COLUMN "error",
ADD COLUMN     "lastError" TEXT;
