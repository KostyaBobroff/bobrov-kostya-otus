-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks_assessments" DROP CONSTRAINT "tasks_assessments_task_id_fkey";

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks_assessments" ADD CONSTRAINT "tasks_assessments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
