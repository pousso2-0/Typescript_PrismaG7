/*
  Warnings:

  - You are about to drop the `OrderDetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderDetail` DROP FOREIGN KEY `OrderDetail_articleId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDetail` DROP FOREIGN KEY `OrderDetail_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- DropTable
DROP TABLE `OrderDetail`;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
