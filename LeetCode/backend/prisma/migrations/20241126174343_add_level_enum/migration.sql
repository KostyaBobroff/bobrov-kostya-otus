/*
  Warnings:

  - The `level` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "level",
ADD COLUMN     "level" "Level" NOT NULL DEFAULT 'EASY';
