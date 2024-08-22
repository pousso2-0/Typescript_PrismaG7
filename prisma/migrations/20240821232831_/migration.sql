/*
  Warnings:

  - A unique constraint covering the columns `[storeId,articleId]` on the table `Catalogue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- CreateIndex
CREATE UNIQUE INDEX `Catalogue_storeId_articleId_key` ON `Catalogue`(`storeId`, `articleId`);

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
