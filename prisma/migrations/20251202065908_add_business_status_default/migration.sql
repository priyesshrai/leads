/*
  Warnings:

  - Made the column `businessStatus` on table `FollowUp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FollowUp" ALTER COLUMN "businessStatus" SET NOT NULL,
ALTER COLUMN "businessStatus" SET DEFAULT 'Client will Call';
