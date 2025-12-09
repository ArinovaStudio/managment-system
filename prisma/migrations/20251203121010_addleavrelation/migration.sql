/*
  Warnings:

  - Added the required column `updatedAt` to the `leaveReq` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leaveReq" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "leaveReq" ADD CONSTRAINT "leaveReq_empId_fkey" FOREIGN KEY ("empId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
