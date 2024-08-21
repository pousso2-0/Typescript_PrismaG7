/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Category_userId_key` ON `Category`(`userId`);

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
