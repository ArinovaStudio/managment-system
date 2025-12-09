/*
  Warnings:

  - Added the required column `userId` to the `leaveReq` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leaveReq" DROP CONSTRAINT "leaveReq_empId_fkey";

-- AlterTable
ALTER TABLE "leaveReq" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "leaveReq" ADD CONSTRAINT "leaveReq_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
