/*
  Warnings:

  - Made the column `qrData` on table `qr_codes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `qr_codes_createdAt_idx` ON `qr_codes`;

-- AlterTable
ALTER TABLE `qr_codes` MODIFY `qrData` LONGTEXT NOT NULL,
    MODIFY `format` VARCHAR(191) NOT NULL DEFAULT 'png',
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `urls` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` MODIFY `password` VARCHAR(255) NULL,
    MODIFY `provider` VARCHAR(191) NOT NULL DEFAULT 'credentials',
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
