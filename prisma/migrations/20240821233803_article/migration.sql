/*
  Warnings:

  - You are about to drop the column `price` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `stockCount` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- AlterTable
ALTER TABLE `Article` DROP COLUMN `price`,
    DROP COLUMN `stockCount`,
    DROP COLUMN `storeId`;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
