/*
  Warnings:

  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `parentId`,
    ADD COLUMN `reaction` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
