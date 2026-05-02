CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `users_email_key` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `urls` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `originalUrl` TEXT NOT NULL,
  `shortCode` VARCHAR(20) NOT NULL,
  `title` VARCHAR(191) NULL,
  `clickCount` INTEGER NOT NULL DEFAULT 0,
  `userId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NULL,
  `lastClickedAt` DATETIME(3) NULL,
  UNIQUE INDEX `urls_shortCode_key` (`shortCode`),
  INDEX `urls_createdAt_idx` (`createdAt`),
  INDEX `urls_userId_createdAt_idx` (`userId`, `createdAt`),
  INDEX `urls_clickCount_idx` (`clickCount`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `clicks` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `urlId` INTEGER NOT NULL,
  `ipAddress` VARCHAR(64) NULL,
  `userAgent` VARCHAR(512) NULL,
  `referer` VARCHAR(512) NULL,
  `countryCode` CHAR(2) NULL,
  `clickedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `clicks_urlId_clickedAt_idx` (`urlId`, `clickedAt`),
  INDEX `clicks_clickedAt_idx` (`clickedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `urls`
  ADD CONSTRAINT `urls_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `clicks`
  ADD CONSTRAINT `clicks_urlId_fkey`
  FOREIGN KEY (`urlId`) REFERENCES `urls`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
