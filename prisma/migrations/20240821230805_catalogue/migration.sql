-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_StatusViewer`;

-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `FK_View_User`;

-- CreateTable
CREATE TABLE `Catalogue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `articleId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `stockCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_User` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `FK_View_StatusViewer` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catalogue` ADD CONSTRAINT `Catalogue_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catalogue` ADD CONSTRAINT `Catalogue_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
